export class Ajax
{
    static send(xhr, body, text = true)
    {
        return new Promise((resolve, reject) =>
        {
            xhr.addEventListener("load", () => resolve(text ? xhr.responseText : xhr.response));
            xhr.addEventListener("error", () => reject(xhr.status));
            xhr.send(body);
        });
    }
    static getBlob(url)
    {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.open("GET", url);
        return this.send(xhr, undefined, false);
    }
    static getBlobWithCredentials(url)
    {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.open("GET", url);
        xhr.withCredentials = true;
        return this.send(xhr, undefined, false);
    }
    static async getJson(url)
    {
        return JSON.parse(await this.getText(url));
    }
    static async getJsonWithCredentials(url)
    {
        return JSON.parse(await this.getTextWithCredentials(url));
    }
    static getText(url)
    {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        return this.send(xhr);
    }
    static getTextWithCredentials(url)
    {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.withCredentials = true;
        return this.send(xhr);
    }
    static postText(url, body)
    {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        return this.send(xhr, body);
    }
    static postTextWithCredentials(url, body)
    {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        return this.send(xhr, body);
    }
}
export function downloadText(url, load, error) // The old method for compatibility
{
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    if (load !== undefined) // callback
    {
        xhr.addEventListener("load", () => load && load(xhr.responseText));
        xhr.addEventListener("error", () => error && error(xhr.status));
        xhr.send();
    }
    else
    {
        return new Promise((resolve, reject) =>
        {
            xhr.addEventListener("load", () => resolve(xhr.responseText));
            xhr.addEventListener("error", () => reject(xhr.status));
            xhr.send();
        });
    }
}