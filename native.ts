/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 iFlex0x
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";

// Contentful API base URL
const CONTENTFUL_API_BASE = "https://api.contentful.com";
const CONTENTFUL_UPLOAD_BASE = "https://upload.contentful.com";

async function makeContentfulRequest(endpoint: string, options: RequestInit) {
  try {
    const url = `${CONTENTFUL_API_BASE}${endpoint}`;
    const res = await fetch(url, options);
    const data = await res.text();
    return { ok: res.ok, status: res.status, data };
  } catch (e: any) {
    return { ok: false, status: -1, data: e?.message ?? "Unknown fetch error" };
  }
}

async function makeContentfulUploadRequest(endpoint: string, options: RequestInit) {
  try {
    const url = `${CONTENTFUL_UPLOAD_BASE}${endpoint}`;
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (e: any) {
    return { ok: false, status: -1, data: { message: e?.message ?? "Unknown upload error" } };
  }
}

export async function uploadAssetBinary(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, assetArrayBuffer: ArrayBuffer) {
  return makeContentfulUploadRequest(`/spaces/${spaceId}/uploads`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/octet-stream",
    },
    body: Buffer.from(assetArrayBuffer),
  });
}

export async function createAsset(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, body: string) {
  return makeContentfulRequest(`/spaces/${spaceId}/environments/master/assets`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
    },
    body,
  });
}

export async function processAsset(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, assetId: string, version: number) {
  return makeContentfulRequest(`/spaces/${spaceId}/environments/master/assets/${assetId}/files/en-US/process`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Version": version.toString(),
    },
  });
}

export async function getAsset(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, assetId: string) {
  return makeContentfulRequest(`/spaces/${spaceId}/environments/master/assets/${assetId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
    },
  });
}

export async function publishResource(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, resourceType: "assets" | "entries", resourceId: string, version: number) {
  return makeContentfulRequest(`/spaces/${spaceId}/environments/master/${resourceType}/${resourceId}/published`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Version": version.toString(),
    },
  });
}

export async function createEntry(_: IpcMainInvokeEvent, spaceId: string, cmaToken: string, modelId: string, body: string) {
  return makeContentfulRequest(`/spaces/${spaceId}/environments/master/entries`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cmaToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Content-Type": modelId,
    },
    body,
  });
}
