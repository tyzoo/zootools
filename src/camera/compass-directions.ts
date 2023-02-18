export type CompassDirections = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function getCompassDirection(cameraRotation: Quaternion): CompassDirections {
    const cameraEuler = cameraRotation.eulerAngles;
    const yaw = cameraEuler.y;
    if (yaw >= 337.5 || yaw < 22.5) return "n";
    else if (yaw >= 22.5 && yaw < 67.5) return "ne";
    else if (yaw >= 67.5 && yaw < 112.5) return "e";
    else if (yaw >= 112.5 && yaw < 157.5) return "se";
    else if (yaw >= 157.5 && yaw < 202.5) return "s";
    else if (yaw >= 202.5 && yaw < 247.5) return "sw";
    else if (yaw >= 247.5 && yaw < 292.5) return "w";
    else if (yaw >= 292.5 && yaw < 337.5) return "nw";
    else return "n";
}

export function getCameraCompassDirection(): CompassDirections{
    return getCompassDirection(Camera.instance.rotation);
}