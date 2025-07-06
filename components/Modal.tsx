/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 iFlex0x
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { React, Button, TextInput, Checkbox, Text } from "@webpack/common";
import { ModalRoot, ModalHeader, ModalContent, ModalFooter, ModalCloseButton, ModalProps } from "@utils/modal";

export const ContentfulUploadModal = ({
  imageUrl,
  artistName,
  onUpload,
  ...modalProps
}: {
  imageUrl: string;
  artistName: string;
  onUpload: (data: any) => Promise<void>;
} & ModalProps) => {
  const [name, setName] = React.useState("");
  const [isSpoiler, setIsSpoiler] = React.useState(false);
  const [displayOnHomepage, setDisplayOnHomepage] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setModalError(null);
    if (!name.trim()) {
      setModalError("Image name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await onUpload({
        name: name.trim(),
        imageUrl,
        artist: artistName,
        isSpoiler,
        displayOnHomepage,
      });
      modalProps.onClose();
    } catch (error: any) {
      setModalError("An error occurred during upload. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = {
    marginBottom: '8px',
  };

  return (
    <ModalRoot {...modalProps}>
      <ModalHeader>
        <Text variant="heading-lg/semibold">Upload Image to Contentful</Text>
        <ModalCloseButton onClick={modalProps.onClose} />
      </ModalHeader>
      <ModalContent>
        <div style={{ marginBottom: "16px" }}>
          <Text variant="text-sm/semibold" style={labelStyle}>Image Name:</Text>
          <TextInput id="image-name" value={name} onChange={setName} placeholder="Enter a descriptive name" autoFocus />
        </div>
        
        <div style={{ marginBottom: "16px" }}>
          <Text variant="text-sm/semibold" style={labelStyle}>Artist:</Text>
          <Text variant="text-md/normal">{artistName || "Unknown Artist"}</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: "16px" }}>
          <Checkbox value={isSpoiler} onChange={() => setIsSpoiler(!isSpoiler)} type="checkbox" />
          <Text variant="text-md/normal" style={{ marginLeft: "8px" }}>Has Spoilers?</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: "16px" }}>
          <Checkbox value={displayOnHomepage} onChange={() => setDisplayOnHomepage(!displayOnHomepage)} type="checkbox" />
          <Text variant="text-md/normal" style={{ marginLeft: "8px" }}>Display on Homepage?</Text>
        </div>

        {modalError && <Text color="text-danger" style={{ marginTop: "10px" }}>{modalError}</Text>}
        {imageUrl && <div style={{ marginTop: "20px", textAlign: "center" }}><img src={imageUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }} /></div>}
      </ModalContent>
      <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button onClick={modalProps.onClose} disabled={isLoading} size={Button.Sizes.SMALL} color={Button.Colors.PRIMARY}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isLoading || !name.trim()} size={Button.Sizes.SMALL} color={Button.Colors.GREEN}>
          {isLoading ? "Uploading..." : "Upload to Contentful"}
        </Button>
      </ModalFooter>
    </ModalRoot>
  );
};
