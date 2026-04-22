export const toLocalISOTime = (inputDate) => {
    const date = new Date(inputDate);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 19);
    return localISOTime;
};

export const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(Number(timestamp));
    if (isNaN(d.getTime())) return "";

    const pad = (n) => n.toString().padStart(2, '0');

    // YYYY-MM-DDTHH:mm:ss formatı
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

