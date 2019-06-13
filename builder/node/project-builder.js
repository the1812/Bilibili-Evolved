
class ProjectBuilder
{
    constructor(source, silent = false)
    {
        this.source = source;
        this.silent = silent;
        console.info("[Bilibili Evolved] Project builder started.");
        console.info(`Working directory: ${process.cwd()}`);
    }

}

(() =>
{
    new ProjectBuilder();
})();