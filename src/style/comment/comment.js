// Style key looks strange as it's a generated key
resources.applyImportantStyle("useCommentStyleStyle");
export default {
    reload: () => resources.applyImportantStyle("useCommentStyleStyle"),
    unload: () => resources.removeStyle("useCommentStyleStyle"),
}