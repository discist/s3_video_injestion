const AWS = require('aws-sdk')
require('dotenv').config();
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const express = require("express");
const upload = require("express-fileupload");
const fs = require('fs');


const cors = require('cors');
const corsOption = {
    origin: ['http://locadlhost:3000' , "https://discist.com"],
};




const logger = {
    debug: console.log,
    info: console.log,
    warning: console.warn,
    error: console.error,
};

let customerEndpoint = 'https://htunurlzb.mediaconvert.ap-south-1.amazonaws.com';

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'ap-south-1'
});


const s3 = new AWS.S3();
async function putS3(body, filename, metaData) {


    return new Promise((resolve, reject) => {

        s3.putObject({
            Body: body,
            Bucket: 'discist',
            Key: filename,
            ContentType: metaData
        }, (error, data) => {
            if (error) {
                console.log(error);
                reject(err);
            } else {
                console.log(`File uploaded: ${data}`);
                resolve(data);
            }
        });

    })
}






let jobs = [
   
];
const app = express();
var path = require("path");

const port = 2000;

app.use(express.static(path.join(__dirname, "public"))); //  "public" off of current is root

app.use(cors(corsOption));
app.use(cors())

app.use(
    upload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);





const mediaConvert = new AWS.MediaConvert({ endpoint: customerEndpoint });




app.get("/", (req, res) => {
    res.send("there")
});


let mediaConvertParams = {
    "Settings": {
        "Inputs": [
            {
                "TimecodeSource": "ZEROBASED",
                "VideoSelector": {},
                "AudioSelectors": {
                    "Audio Selector 1": {
                        "DefaultSelection": "DEFAULT"
                    }
                },
                "FileInput": "s3://discist/2592Why Startup IPOs like Mamaearth are a Scam_.mp4"
            }
        ],
        "OutputGroups": [
            {
                "Name": "Apple HLS",
                "OutputGroupSettings": {
                    "Type": "HLS_GROUP_SETTINGS",
                    "HlsGroupSettings": {
                        "SegmentLength": 10,
                        "MinSegmentLength": 0,
                        "Destination": "s3://discisthls/"
                    }
                },
                "Outputs": [
                    {
                        "Preset": "System-Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps",
                        "NameModifier": "-modify",
                        "OutputSettings": {
                            "HlsSettings": {
                                "SegmentModifier": "a"
                            }
                        }
                    }
                ],
                "CustomName": "hsl"
            },
            {
                "Name": "Thumbnail",
                "OutputGroupSettings": {
                    "Type": "FILE_GROUP_SETTINGS",
                    "FileGroupSettings": {
                        "Destination": "s3://discist/thumbnail-output/"
                    }
                },
                "Outputs": [
                    {
                        "Preset": "System-Thumbnail",
                        "NameModifier": "-thumbnail",
                        "Extension": "jpg"
                    }
                ]
            }
        ],
        "TimecodeConfig": {
            "Source": "ZEROBASED"
        }
    },
    "Role": "arn:aws:iam::380891602497:role/service-role/MediaConvert_Default_Role"
}


function transHSL(s3destination, filename , res) {

var parts = s3destination.split("/");
parts.pop();
var base_s3 = parts.join('/');
console.log(base_s3);

    const params = {
        AccelerationSettings: {
            Mode: 'DISABLED'
        },
        Settings: {
            Inputs: [
                {


                    TimecodeSource: "ZEROBASED",
                    VideoSelector: {},
                    AudioSelectors: {
                        "Audio Selector 1": {
                            DefaultSelection: "DEFAULT"
                        }
                    },
                    FileInput: `${s3destination}`
                }
            ],
            OutputGroups: [
                {
                    Name: "Apple HLS",
                    OutputGroupSettings: {
                        Type: "HLS_GROUP_SETTINGS",
                        HlsGroupSettings: {
                            SegmentLength: 10,
                            MinSegmentLength: 0,
                            Destination: "s3://discisthls/"
                        }
                    },
                    Outputs: [
                        {
                            Preset: "System-Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps",
                            NameModifier: "-modify",
                            OutputSettings: {
                                HlsSettings: {
                                    SegmentModifier: "a"
                                }
                            }
                        }
                    ],
                    CustomName: "hsl"
                },

                {
                    "Name": "File Group",
                    "OutputGroupSettings": {
                      "Type": "FILE_GROUP_SETTINGS",
                      "FileGroupSettings": {
                        "Destination": "s3://discisthls/"
                      }
                    },
                    "Outputs": [
                      {
                        "VideoDescription": {
                          "CodecSettings": {
                            "Codec": "FRAME_CAPTURE",
                            "FrameCaptureSettings": {
                              "Quality": 80,
                              "FramerateNumerator": 1,
                              "FramerateDenominator": 100,
                              "MaxCaptures": 2
                            }
                          },
                          "Width": 1280,
                          "Height": 730
                        },
                       
                        "ContainerSettings": {
                          "Container": "RAW"
                        },
                        "NameModifier": "noice",
                        "Extension": "jpeg"
                      }
                    ],
                    "CustomName": "-thumb"
                  }


                
                
            ],
            TimecodeConfig: {
                Source: "ZEROBASED"
            }
        },
        Role: "arn:aws:iam::380891602497:role/service-role/MediaConvert_Default_Role"
    };
    
    let streaming_link
    let thumbnail_link
    mediaConvert.createJob(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {

            let arr = filename.split(".")
            let name = arr[0]
            console.log(arr[0]);
            console.log("cloud watch streaming link", `https://d2ymp7m89s75n5.cloudfront.net/${name}.m3u8`);
             streaming_link =  `https://d2ymp7m89s75n5.cloudfront.net/${name}.m3u8`
             thumbnail_link =  `https://d2ymp7m89s75n5.cloudfront.net/${name}noice.0000001.jpeg`

            
        } console.log(data);

        console.log("LOG SEND RESSPONSE");
        let jobId = data.Job.Id

        res.json({stream_link: streaming_link , thumbnail_link: thumbnail_link ,  job_id: jobId });


        
      

        jobs.push({id: jobId , status: "QUE"})
        console.log("created job " , jobs);
       
        let params = { Id: jobId };

        const intr = setInterval(() => {

            mediaConvert.getJob(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log("job: " + jobId, "=>", data.Job.Status);
                   




                    if (data.Job.Status == "COMPLETE" || data.Job.Status == "ERROR") {
                        clearInterval(intr)

                      
                    }


                    // "SUBMITTED" means the job has been submitted
                    // "PROGRESSING" means the job is currently in progress
                    // "COMPLETE" means the job is completed
                    // "ERROR" means the job has failed
                }
            });

        }, 3000)


        


    });

}




app.post("/upload_video_streaming_content", (req, res) => {


    if (req.files) {
        console.log("THE FILE IS UPLOADED");
        var file = req.files.file;
        let filename = file.name;
        filename = `${Math.floor(Math.random() * 10000)}${filename}`
        file.mv("./public/uncompressed/" + filename, function (err) {
            if (err) {
                res.send(err);
            } else {

                const fileBuffer = fs.readFileSync("./public/uncompressed/" + filename);
                const metaData = getContentTypeByFile(filename);
                console.log("file succefully saved", metaData);



                console.log("started s3 bucket upload....");
                putS3(fileBuffer, filename, metaData ).then(data => {

                    let location = `https://discist.s3.ap-south-1.amazonaws.com/${filename}`
                    let s3_location = `s3://discist/${filename}`
                    console.log("location:", location);


                    transHSL(s3_location , filename , res)
                   












                })
                    .catch(error => console.log(error))



            }
        });




    }
});
 

app.get('/job/:id', (req, res) => {
    const jobId = req.params.id;
    const params = { Id: jobId };
    mediaConvert.getJob(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
            res.status(500).json({ error: 'Error fetching job' });
        } else {
            res.json(data.Job);
        }
    });
});

function getContentTypeByFile(fileName) {
    const fileType = fileName.split('.').pop();
    switch (fileType) {
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        default:
            return `image/${fileType}`;
    }
}



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);



    console.log("SERVER RUNNING ON PORT ", port);


});
