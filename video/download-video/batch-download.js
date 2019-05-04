class BangumiBatch
{
    static test()
    {
        return document.URL.includes("/www.bilibili.com/bangumi");
    }
    async collectData()
    {
        return `{x:"test"}`;
    }
}
const extractors = [BangumiBatch];
export class BatchExtractor
{
    async collectData()
    {
        const extractor = new (extractors.find(it => it.test()));
        return await extractor.collectData();
    }
}
export default {
    export: {
        BatchExtractor,
    },
};