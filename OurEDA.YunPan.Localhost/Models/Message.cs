using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OurEDA.YunPan.Localhost.Models
{
    public class Message
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public DateTime CreateTime { get; set; }
        public string Content { get; set; }
    }
}