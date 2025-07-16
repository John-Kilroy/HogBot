const fs_utils = require('fs');
const path = require('path');
let POINTS_FILE;
let data = {};

module.exports = {
    init(filePath) {
        POINTS_FILE = filePath;
        const dir = path.dirname(POINTS_FILE);
        if(!fs_utils.existsSync(dir)) {
            fs_utils.mkdirSync(dir, { recursive:true});
        }
        let fileContent ='{}';
        if (fs_utils.existsSync(POINTS_FILE)) {
            fileContent = fs_utils.readFileSync(POINTS_FILE, 'utf8').trimEnd();
        }
        try {
            data = fileContent ? JSON.parse(fileContent) : {};
        } catch (err) {
            console.warn('Warning: invalid JSON in points file, resetting to empty.');
            data = {};
        }

        fs_utils.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    },

    getPoints(userId) {
        if(!(userId in data)) {
            data[userId] = 100;
            fs_utils.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2), 'utf8');
        }
        return data[userId];
    },

    setPoints(userId, pts) {
        data[userId] = pts;
        fs_utils.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    },

    changePoints(userId, delta) {
        const current = this.getPoints(userId);
        const updated = current + delta;
        this.setPoints(userId, updated);
        return updated;
    }
};