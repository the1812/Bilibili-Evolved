const key = "hideBannerStyle";
resources.applyStyle(key);
export default {
    reload: () => resources.applyStyle(key),
    unload: () => resources.removeStyle(key),
};