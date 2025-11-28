const http = require('http');

const app = http.createServer((req, res) => {
    res.write("hhjjjk")
    res.end()
})


app.listen(3000)