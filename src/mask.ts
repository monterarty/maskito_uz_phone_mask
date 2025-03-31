import type { MaskitoOptions, MaskitoPreprocessor } from "@maskito/core";
import {
    maskitoAddOnFocusPlugin,
    maskitoCaretGuard,
    maskitoPrefixPostprocessorGenerator,
    maskitoRemoveOnBlurPlugin,
} from "@maskito/kit";

export default {
    // Маска: +998 (XX) XXX XX XX
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
        // Смешанный подход - для вставки полного номера добавляем специальный префикс
        createGuidedPreprocessor(),
    ],
} satisfies MaskitoOptions;

// Препроцессор с подсказкой для маски
function createGuidedPreprocessor(): MaskitoPreprocessor {
    return ({ data, elementState }) => {
        const { selection, value } = elementState;

        // Проверяем, выглядит ли это как полный номер с кодом страны
        const digitsOnly = data.replace(/\D/g, "");

        // Если это похоже на полный номер с кодом страны
        if (digitsOnly.startsWith("998") && digitsOnly.length >= 12) {
            // Тут хитрость: мы добавляем два специальных символа перед номером.
            // Они будут "съедены" маской вместо первой цифры номера.
            const phoneDigits = digitsOnly.substring(3);
            const processedData = "##" + phoneDigits;

            console.log("Обработка полного номера:", data);
            console.log("Преобразовано в:", processedData);

            return {
                data: processedData,
                elementState: {
                    selection,
                    value
                }
            };
        }

        // Если это просто номер без кода страны
        if (digitsOnly.length >= 9 && !digitsOnly.startsWith("998")) {
            // Та же хитрость: добавляем символы-заполнители
            const processedData = "##" + digitsOnly;

            console.log("Обработка номера без кода:", data);
            console.log("Преобразовано в:", processedData);

            return {
                data: processedData,
                elementState: {
                    selection,
                    value
                }
            };
        }

        // Для всех остальных случаев возвращаем как есть
        return {
            data,
            elementState: {
                selection,
                value
            }
        };
    };
}