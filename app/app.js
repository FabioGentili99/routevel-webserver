const express = require("express");
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const route2vel_module = require("./routes/route2vel_route.js");
const admin_module = require("./routes/admin_route.js");

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e8
  });

app.use("/route", route2vel_module.router); // Adding external route
app.use("/admin", admin_module.router); // Adding admin functionalities

app.get("/ping", (req, res) => {
    const ping_response = {
        message: "pong"
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(ping_response));
});

app.get("/", (req, res) => {
    res.redirect("/route");
});

app.get("/admin", (req, res) => {
    res.redirect("/admin");
});


// Websocket handlers
io.on("connection", (socket) => {
    const client_id = socket.id
    console.log("New client connected with ID:", client_id);

    socket.on("disconnect", () => {
        console.log("Client ", client_id, "disconnected...");
    });
    socket.on("connect_error", (err) => {
        console.log("Error in socket", client_id, err);
    });
    socket.on("connect_timeout", (err) => {
        console.log("Connection timeout in socket", client_id, err);
    });
    socket.on("get_route", (msg) => {
        route2vel_module.handlers.submit_route_request(client_id, socket, msg)
    })
    socket.on("get_route_by_addr", (msg) => {
        route2vel_module.handlers.submit_route_request_by_addr(client_id, socket, msg)
    })
    socket.on("update", (msg) => {
        route2vel_module.handlers.handle_updates(client_id, socket, msg)
    })
    socket.on("update_by_addr", (msg) => {
        route2vel_module.handlers.handle_updates_by_addr(client_id, socket, msg)
    })    
    socket.on("route_data", (msg) => {
        route2vel_module.handlers.handle_route_data(client_id, socket, msg)
    })
    socket.on("route_data_by_addr", (msg) => {
        route2vel_module.handlers.handle_route_data_by_addr(client_id, socket, msg)
    })    
    socket.on("route_wc_data_by_addr", (msg) => {
        route2vel_module.handlers.handle_route_wc_data_by_addr(client_id, socket, msg)
    })    
    socket.on("route_error", (msg) => {
        route2vel_module.handlers.handle_route_error(client_id, socket, msg)
    })
    socket.on("route_error_by_addr", (msg) => {
        route2vel_module.handlers.handle_route_error_by_addr(client_id, socket, msg)
    })    
    socket.on("join", (msg) => {
        console.log(socket.id, "joining room", msg["room"])
        socket.join(msg["room"])
    })
});

io.on("connect_error", (err) => {
    console.log("Error in socket", err);
});

io.on("connect_timeout", (err) => {
    console.log("Connection timeout in socket", err);
});


// Server start
server.listen(port, () => {
  console.log(`Web server listening at http://localhost:${port}`);
});
