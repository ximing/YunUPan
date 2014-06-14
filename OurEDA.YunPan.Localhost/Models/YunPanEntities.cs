using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace OurEDA.YunPan.Localhost.Models
{
    public class YunPanEntities : DbContext
    {
        public YunPanEntities() : base("name=DefaultConnection") { }
        public DbSet<FileStore> FileStores { get; set; }
        public DbSet<Iplimit> Iplimits { get; set; }
    }
}