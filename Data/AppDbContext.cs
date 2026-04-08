using Microsoft.EntityFrameworkCore;
using api.Models;
using System.Reflection;

namespace api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<ScreenMaster> ScreenMaster { get; set; }

        public DbSet<GroupMaster> GroupMaster { get; set; }

        public DbSet<GroupFieldsMaster> GroupFieldsMaster { get; set; }

        public DbSet<FieldValidation> FieldValidation { get; set; }

        public DbSet<ModuleHeader> ModuleHeader {get; set;}

        public DbSet<ModuleMst> ModuleMst { get; set; }

        public DbSet<MenuMst> MenuMst { get; set; }

        public DbSet<Approval> Approvals { get; set; }
        public DbSet<Approver> Approvers { get; set; }
        public DbSet<ApprovalScreenMapping> ApprovalScreenMappings { get; set; }    

        public DbSet<User> Users { get; set; }
        public DbSet<LookUp> LookUp { get; set; }
    }
}
