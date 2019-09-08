var express = require("express");
var phantom = require("phantom");
var gm = require("gm");
var fs = require("fs");

var httpserver;
async function saveHTMLAsPDF(uriname, targetname)
{
    let inst = await phantom.create();
    let page = await inst.createPage();
    await page.on("onResourceRequested", function(rqData)
    {
        console.info("requesting", rqData.url);
    });
    var succeeded = false;
    await page.open(uriname).then(async function(status)
    {
        if(status === "success")
        {
            console.log("rendering");
            await page.render(targetname);
            console.log("rendered");
            succeeded = true;
        }
        else
        {
            console.log("status: " + status);
        }
        await inst.exit();
        console.log("instance exited");
    });
    return succeeded
}
function main()
{
    let webserver = express();
    webserver.get("/", function(req, res)
    {
        fileData = fs.readFileSync("./template.html", "utf-8");
        res.send(fileData);
    });
    httpserver = webserver.listen(5524, async function()
    {
        saveHTMLAsPDF("http://localhost:5524/", "test.png").then(function()
        {
            httpserver.close();
            gm("./test.png")
                .crop(724, 1024)
                .write("./test.png", function(err)
                {
                    if(err)
                    {
                        console.log(err);
                    }
                });
        });
    });
}

main();