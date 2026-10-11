import { useEffect, useState } from "react";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    return isMobile;
}
