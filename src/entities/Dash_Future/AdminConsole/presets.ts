import { Dash_Material } from "dcldash"
import { ZooTools_Materials } from "../../../utils/Materials"

import { AdminButtonClickAnimationSetting, AdminButtonMaterialConfig } from "./interfaces"

export const AdminButtonMaterialDefault:AdminButtonMaterialConfig = {
    on: ZooTools_Materials["Green"],
    // off: Material_Cyan, //Material_Black_Medium,
    off: ZooTools_Materials["Gray"],
    hover: ZooTools_Materials["Blue"],
    disabled: Dash_Material.Red(),
}

export const AdminButtonClickAnimationDefault:AdminButtonClickAnimationSetting = {
    x: true,
    y: true,
    z: true,
}

export const AdminPanelBackgroundMaterial = ZooTools_Materials["Black"]