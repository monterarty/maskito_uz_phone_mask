import {useMaskito} from '@maskito/react';
import { isIOS } from "react-device-detect";
import options from './mask';

export default function App() {
    const maskedInputRef = useMaskito({options});
    const getPhonePattern = (): null | {
        autoComplete: "tel";
        inputMode: "tel";
        pattern: string;
    } => {
        if (!isIOS) return null;

        return {
            autoComplete: "tel",
            inputMode: "tel",
            pattern: "+[0-9-]{1,20}",
        };
    };
    return <input ref={maskedInputRef}
                  {...getPhonePattern()}
    />;
}