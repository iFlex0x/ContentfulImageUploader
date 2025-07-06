/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 iFlex0x
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
  spaceId: {
    type: OptionType.STRING,
    description: "Your Contentful Space ID.",
    placeholder: "Enter your Space ID",
    default: "",
  },
  cmaToken: {
    type: OptionType.STRING,
    description: "Your Contentful Content Management API (CMA) Token.",
    placeholder: "Enter your CMA Token",
    default: "",
  },
  modelId: {
    type: OptionType.STRING,
    description: "The ID of the Content Model for your image entries.",
    placeholder: "Enter your Content Model ID",
    default: "",
  },
});
