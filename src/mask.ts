import type { MaskitoOptions, MaskitoPreprocessor } from "@maskito/core";
import {
    maskitoAddOnFocusPlugin,
    maskitoCaretGuard,
    maskitoPrefixPostprocessorGenerator,
    maskitoRemoveOnBlurPlugin,
} from "@maskito/kit";

export default {
    // Маска: +998 (XX) XXX-XX-XX
    mask: [
        "+",
        "9",
        "9",
        "8",
        " ",
        "(",
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        " ",
        /\d/,
        /\d/,
        " ",
        /\d/,
        /\d/,
    ],
    plugins: [
        // При фокусе добавляем +998, если поле было пустым
        maskitoAddOnFocusPlugin("+998 "),
        // Если пользователь стёр всё, то при блюре убираем +998
        maskitoRemoveOnBlurPlugin("+998 "),
        // Запрещаем каретке вставать до неотделимого префикса
        maskitoCaretGuard((value, [from, to]) => {
            // Если курсор «схлопнут» (from === to), сдвигаем его вперёд на длину префикса
            // Иначе — разрешаем выделять весь текст
            return [from === to ? "+998 ".length : 0, value.length];
        }),
    ],
    postprocessors: [
        // Не даём удалить префикс +998 и автоматически восстанавливаем при вводе
        maskitoPrefixPostprocessorGenerator("+998 "),
    ],
    preprocessors: [
        // Автоматически «обрезаем» лишний префикс (если пользователь вставил 8 или 998)
        createCompletePhoneInsertionPreprocessor(),
    ],
} satisfies MaskitoOptions;

function createCompletePhoneInsertionPreprocessor(): MaskitoPreprocessor {
    // Убираем варианты префиксов: +998..., 998..., 8...
    const trimPrefix = (value: string): string =>
        value.replace(/^(\+?998|998)\s?/, "");
    const countDigits = (value: string): number =>
        value.replace(/\D/g, "").length;

    return ({ data, elementState }) => {
        const { selection, value } = elementState;
        console.log(data, elementState);
        console.log(countDigits(data) >= 12 ? trimPrefix(data) : data);
        return {
            // Если во «вставляемых» данных больше или равно 12 цифр, убираем префикс
            data: countDigits(data) >= 12 ? trimPrefix(data) : data,

            elementState: {
                selection,
                // Если в общем тексте уже больше 12 цифр (т.е. +998 + 9 цифр), убираем префикс
                value: countDigits(value) > 12 ? trimPrefix(value) : value,
            },
        };
    };
}
