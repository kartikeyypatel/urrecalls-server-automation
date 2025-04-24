import React from 'react';
import { Image } from 'react-native-elements';
import { em } from "styles/main_styles";

/**
 * URL for getting images of food products
 */
export const image_host = "https://sifter.imgix.net/"; // CDN host

/**
 * Params for styling the image
 */
export const image_params = ".webp?fit=max&w=200&h=200";

export type FoodIconProps = {
    /**
     * URL for the image
     */
    url: string,
}
export default function FoodIcon({url}: FoodIconProps) {
    return (<Image source={{ uri: url }} style={{width: 4*em, height: 4*em, aspectRatio: 1, borderRadius: 1*em}}/>);
}
export function foodToUrl(image_path: string): string {
    return image_host + image_path + image_params;
}