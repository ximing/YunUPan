using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OurEDA.YunPan.Localhost.Models
{
    public class FileStore
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string RandName { get; set; }
        public string MimeType { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public DateTime date { get; set; }
    }
}