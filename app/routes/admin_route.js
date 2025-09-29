const fs = require('fs');
const path = require('path');
const express = require('express');
const basicAuth = require('express-basic-auth');
const { spawn } = require('node:child_process');
const http = require('http');
const router = express.Router();

router.use(express.static('static'));
router.use(express.static(path.join(__dirname, '..', '..', 'node_modules', 'bootstrap', 'dist')));
router.use(express.static(path.join(__dirname, '..', '..', 'node_modules', 'bootstrap-icons', 'font')));


var tasks = []

router.get("/", basicAuth({
        users: { admin: 'admin' },
        challenge: true // <--- needed to actually show the login dialog!
    }), (req, res) => {

    res.sendFile(path.join(__dirname, '..', '..', 'static', 'admin_page.html'));
});

router.get("/logout", (req, res) => {
    res.status(401).sendFile(path.join(__dirname, '..', '..', 'static', 'admin_logout.html'));
});

//app.use(basicAuth({
//    users: { admin: 'admin' },
//    challenge: true // <--- needed to actually show the login dialog!
//}));

router.get("/task", basicAuth({
        users: { admin: 'admin' },
        challenge: true
    }), (req, res) => {
    tasks = []
    fs.readdirSync(process.env.TASK_FOLDER).forEach(file => {
        tasks.push(file);
    });
    console.log("Tasks: ", tasks)
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(tasks));
});

router.delete("/task", basicAuth({
    users: { admin: 'admin' },
    challenge: true
    }), (req, res) => {
    fs.readdirSync(process.env.TASK_FOLDER).forEach(file => {
    const taskPath = path.join(process.env.TASK_FOLDER, file);
    fs.rmSync(taskPath, { recursive: true, force: true });
    });

    res.sendStatus(200);
});

router.delete("/task/:id", basicAuth({
        users: { admin: 'admin' },
        challenge: true
    }), (req, res) => {
    task_path = path.join(process.env.TASK_FOLDER, req.params.id);
    fs.rmSync(task_path, { recursive: true, force: true });

    res.sendStatus(200);
});


// MAPS

router.get("/maps", basicAuth({
    users: { admin: 'admin' },
    challenge: true
}), (req, res) => {
    fs.readdir(process.env.INDEX_FOLDER, (err, files) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const tokens = files.filter(file => {
            const filePath = path.join(process.env.INDEX_FOLDER, file);
            return fs.lstatSync(filePath).isDirectory();
        }).map(file => {
            // const folderName = file.split('_')[1];
            return file;
        });

        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(tokens));
    });
});

router.get("/switch-map/:map", basicAuth({
    users: { admin: 'admin' },
    challenge: true
}), (req, res) => {
    const mapName = req.params.map;
    const scriptPath = path.join(process.env.INDEX_FOLDER, 'reload_map.sh');
    
    console.log(`Executing bash script ${scriptPath} with map ${mapName}`)
    // Execute the bash script
    const scriptProcess = spawn('bash', [scriptPath, mapName]);

    scriptProcess.on('error', (error) => {
        console.error(`Error executing bash script: ${error}`);
        res.sendStatus(500);
    });

    scriptProcess.on('exit', (code) => {
        if (code === 0) {
            console.log(`Bash script executed successfully`);
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify({ map: mapName }));
        } else {
            console.error(`Bash script exited with code ${code}`);
            res.sendStatus(500);
        }
    });
});

router.get("/active-map", basicAuth({
    users: { admin: 'admin' },
    challenge: true
}), (requ, resu) => {
    const linux_options = {
        socketPath: '/run/docker.sock',
        path: '/containers/osrm_backend-routed/json',
        method: 'GET'
    };

    const win_options = {
        hostname: 'localhost', 
        port: 2375,
        path: '/containers/osrm_backend-routed/json',
        method: 'GET'
    };

    let options;

    if (os.platform() === 'win32') {
        console.log("Using win options")
        options = win_options;
    } else if (os.platform() === 'linux') {
        console.log("Using linux options")
        options = linux_options;
    } else {
        console.error('Unsupported OS');
        process.exit(1);
    }

    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            const jsonData = JSON.parse(data);
            resu.setHeader("Content-Type", "application/json");
            resu.send(JSON.stringify((jsonData.Mounts[0]).Source));
        });
    });

    req.on('error', (error) => {
        console.error(`Error making request to docker socket: ${error}`);
        if (error instanceof AggregateError) {
            console.error('Aggregate error detected:', error.errors);
        }
        resu.sendStatus(500);
    });

    req.end();
});


module.exports.router = router;