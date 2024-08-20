const prisma = require('../helpers/client');

async function checkPath(req) {
    let path = (req.baseUrl + req.path).split('/');
    path[0] = 'root';
    if (path[path.length - 1] == '') {
        path = path.slice(0, path.length - 1);
    }
    console.log(path)
    let folders = await prisma.folder.findMany({ where: { userId: req.user.id } })
    let prev = null;
    let foldersInPath = [];
    for (let i = 0; i < path.length; i++) {
        let found = false;
        for (let j = 0; j < folders.length; j++) {
            if (folders[j].name === path[i] && folders[j].parentId == prev) {
                found = true;
                foldersInPath.push(folders[j]);
                break;
            }
        }
        if (!found) {
            throw new Error("folder " + path[i] + " does not exist")
        }
        prev = foldersInPath[foldersInPath.length - 1].id
    }
    return foldersInPath;
}

async function getFolder(req, res, next) {
    if (!req.user) { return res.redirect('/log-in') }

    try {
        let path = await checkPath(req);
        let folders = await prisma.folder.findMany({ where: { parentId: path[path.length - 1].id } })
        let files = await prisma.file.findMany({ where: { folderId: path[path.length - 1].id } })
        res.render('index', { folders: folders, files: files, currentFolder: path[path.length - 1], currentPath: req.baseUrl + req.path })
    } catch (err) {
        return next(err)
    }
}

module.exports = { getFolder }