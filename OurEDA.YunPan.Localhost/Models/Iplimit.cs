using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OurEDA.YunPan.Localhost.Models
{
    public class Iplimit
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public DateTime BeginTime { get; set; }

        public int Count { get; set; }
        public string IpAdress { get; set; }
    }
}