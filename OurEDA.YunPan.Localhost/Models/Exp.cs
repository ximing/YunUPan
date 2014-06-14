using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OurEDA.YunPan.Localhost.Models
{
    public class Exp
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string Message { get; set; }
    }
}