/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 iFlex0x
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { PluginNative } from "@utils/types";
import { React, Menu, Toasts } from "@webpack/common";
import { findGroupChildrenByChildId } from "@api/ContextMenu";
import { openModal, ModalProps } from "@utils/modal";
import { Logger } from "@utils/Logger";
import { settings } from "./settings";
import { ContentfulUploadModal } from "./components/Modal";
import { ContentfulIcon } from "./components/Icon";

const logger = new Logger("ContentfulImageUploader");

export default definePlugin({
  name: "Contentful Image Uploader",
  description: "Uploads Discord images to Contentful with metadata.",
  authors: [{ name: "saiflex", id: 1007939118925361212n, github: "iFlex0x" }],
  settings,



  contextMenus: {
    "message": (children, { message }) => {
      // check if message has an image attachment
      const hasImage = message?.attachments?.some(att => att.content_type?.startsWith("image/"));
      if (!hasImage) return;

      const group = findGroupChildrenByChildId("copy-text", children);
      if (!group) return;

      group.splice(
        group.findIndex(c => c?.props?.id === "copy-text") + 1,
        0,
        <Menu.MenuItem
          id="upload-to-contentful"
          label="Upload to Contentful"
          icon={ContentfulIcon}
          action={() => {
            const imageUrl = message.attachments?.[0]?.url;
            const artistName = `@${message.author.nick || message.author.username}`;
            if (!imageUrl) return;

            openModal((props: ModalProps) => (
              <ContentfulUploadModal
                {...props}
                imageUrl={imageUrl}
                artistName={artistName}
                onUpload={async (data: any) => {
                  // get the native helper
                  const Native = VencordNative.pluginHelpers["Contentful Image Uploader"] as PluginNative<typeof import("./native")>;
                  if (!Native) {
                    const errorMsg = "Native helper module not found. Please restart Discord and ensure the plugin is properly installed.";
                    logger.error(errorMsg);
                    Toasts.show(errorMsg, { type: Toasts.Type.FAILURE, duration: 10000 });
                    return;
                  }

                  const { spaceId, cmaToken, modelId } = settings.store;

                  // check if plugin is configured
                  if (!spaceId || !cmaToken || !modelId) {
                    Toasts.show("Plugin is not configured. Please fill out all fields in the plugin settings.", { type: Toasts.Type.FAILURE, duration: 8000 });
                    return;
                  }

                  try {
                    // download the image from discord
                    const imageResponse = await fetch(data.imageUrl);
                    if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                    const imageBlob = await imageResponse.blob();
                    const imageArrayBuffer = await imageBlob.arrayBuffer();

                    // upload the binary asset first
                    const assetUploadResult = await Native.uploadAssetBinary(spaceId, cmaToken, imageArrayBuffer);
                    if (!assetUploadResult.ok) throw new Error(`Asset Upload Failed: ${JSON.stringify(assetUploadResult.data)}`);
                    const uploadId = assetUploadResult.data.sys.id;

                    // create the asset entry
                    const assetCreateResponse = await Native.createAsset(spaceId, cmaToken, JSON.stringify({
                      fields: {
                        title: { "en-US": data.name },
                        file: { "en-US": { 
                          fileName: `${data.name.replace(/\s+/g, '-')}.${imageBlob.type.split("/")[1] || 'png'}`, 
                          contentType: imageBlob.type, 
                          uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } } 
                        } }
                      }
                    }));
                    if (!assetCreateResponse.ok) throw new Error(`Asset Creation Failed: ${assetCreateResponse.data}`);
                    const assetEntry = JSON.parse(assetCreateResponse.data);
                    const assetId = assetEntry.sys.id;

                    // process the asset
                    await Native.processAsset(spaceId, cmaToken, assetId, assetEntry.sys.version);
                    logger.log("Asset processing initiated.");

                    // poll until asset is processed
                    const pollAssetProcessing = async (retries = 15, delay = 1000) => {
                      for (let i = 0; i < retries; i++) {
                        const assetStatusResponse = await Native.getAsset(spaceId, cmaToken, assetId);
                        if (!assetStatusResponse.ok) throw new Error(`Failed to poll asset status: ${assetStatusResponse.data}`);
                        const assetData = JSON.parse(assetStatusResponse.data);
                        if (assetData.fields.file['en-US'].url) return assetData;
                        logger.log(`Asset still processing... attempt ${i + 1}/${retries}`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                      }
                      throw new Error("Asset processing timed out.");
                    };

                    const processedAsset = await pollAssetProcessing();

                    // publish the asset
                    await Native.publishResource(spaceId, cmaToken, "assets", assetId, processedAsset.sys.version);

                    // create the content entry
                    const entryFields = {
                      title: { "en-US": data.name },
                      artist: { "en-US": data.artist },
                      image: { "en-US": { sys: { type: "Link", linkType: "Asset", id: assetId } } },
                      spoiler: { "en-US": data.isSpoiler },
                      featuredOnHomepage: { "en-US": data.displayOnHomepage }
                    };

                    const entryCreateResponse = await Native.createEntry(spaceId, cmaToken, modelId, JSON.stringify({ fields: entryFields }));
                    if (!entryCreateResponse.ok) throw new Error(`Entry Creation Failed: ${entryCreateResponse.data}`);
                    const newEntry = JSON.parse(entryCreateResponse.data);

                    // publish the entry
                    await Native.publishResource(spaceId, cmaToken, "entries", newEntry.sys.id, newEntry.sys.version);

                    Toasts.show(`Image "${data.name}" uploaded successfully!`, { type: Toasts.Type.SUCCESS });
                  } catch (error: any) {
                    logger.error("Upload Error:", error);
                    Toasts.show(`Upload failed: ${error.message || "Unknown error"}`, { type: Toasts.Type.FAILURE, duration: 5000 });
                  }
                }}
              />
            ));
          }}
        />
      );
    },
  },
});
