import { StyleSheet } from "react-native";
import * as Localization from "expo-localization";
import { Dict, I18n, Scope, TranslateOptions } from 'i18n-js';

/**
 * Gets the calling stack trace for a function
 * @param full_stack_trace if true, the entire stack trace is added. 
 */
function get_caller(full_stack_trace: boolean): string {
    let caller: string | undefined = (new Error).stack;
    if(caller == undefined)  return "unknown";
    return "called " + (full_stack_trace ? caller : caller = caller?.split('\n')[3].trim());
}

/**
 * Logs message with the calling function recorded.
 */
export function log(message?: any, ...optionalParams: any[]): void {

    console.log("[Log]:",message, ...optionalParams , get_caller(false));
}

/**
 * Logs message with the calling function recorded and the info label.
 * @param message 
 * @param optionalParams 
 */
export function info(message?: any, ...optionalParams: any[]): void {
    console.info("[Info]:", message, ...optionalParams , get_caller(false));
}

/**
 * Logs message with the calling function recorded and the debug label.
 * @param message 
 * @param optionalParams 
 */
export function debug(message?: any, ...optionalParams: any[]): void {
    console.debug("[Debug]:", message, ...optionalParams , get_caller(true));
}

/**
 * Logs message with the calling function recorded and the warning label.
 * @param message 
 * @param optionalParams 
 */
export function warn(message?: any, ...optionalParams: any[]): void {
    console.warn("[Warn]:", message, ...optionalParams , get_caller(true));
}

/**
 * Logs message with the calling function recorded and the error label.
 * @param message 
 * @param optionalParams 
 */
export function error(message?: any, ...optionalParams: any[]): void {
    console.error("[Error]:", message, ...optionalParams , get_caller(true));
}

/**
 * Shorthand for StyleSheet.flatten
 * 
 * Flattens an array of style objects, into one aggregated style object.
 * Alternatively, this method can be used to lookup IDs, returned by
 * StyleSheet.register.
 *
 * > **NOTE**: Exercise caution as abusing this can tax you in terms of
 * > optimizations.
 * >
 * > IDs enable optimizations through the bridge and memory in general. Referring
 * > to style objects directly will deprive you of these optimizations.
 *
 * Example:
 * ```
 * const styles = StyleSheet.create({
 *   listItem: {
 *     flex: 1,
 *     fontSize: 16,
 *     color: 'white'
 *   },
 *   selectedListItem: {
 *     color: 'green'
 *   }
 * });
 *
 * StyleSheet.flatten([styles.listItem, styles.selectedListItem])
 * // returns { flex: 1, fontSize: 16, color: 'green' }
 * ```
 * Alternative use:
 * ```
 * StyleSheet.flatten(styles.listItem);
 * // return { flex: 1, fontSize: 16, color: 'white' }
 * // Simply styles.listItem would return its ID (number)
 * ```
 * This method internally uses `StyleSheetRegistry.getStyleByID(style)`
 * to resolve style objects represented by IDs. Thus, an array of style
 * objects (instances of StyleSheet.create), are individually resolved to,
 * their respective objects, merged as one and then returned. This also explains
 * the alternative use.
 */
export const flatten = StyleSheet.flatten; 

export let i18n: I18n;

/**
 * Initializes the localization with the english localization.
 */
export function initialize_localization() {
    i18n = new I18n();
    i18n.store({"en-US": require("locales/en-US")});

    // Set the locale once at the beginning of your app.
    i18n.locale = Localization.getLocales()[0].languageTag;

    // When a value is missing from a language it'll fall back to another language with the key present.
    i18n.enableFallback = true;
}

/**
 * Shorthand for i18n.t(scope, options?)
 * @param scope 
 * @param options 
 * @returns 
 */
export function t(scope: Scope, options?: TranslateOptions): string {
    return i18n.t(scope, options);
}

export type GlobalType = {
    token?: string,
    refresh_token?: string,
    expires_in?: Date,
    data?: any,
    sifter?: any,
}
export let global: GlobalType = {};
