using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("LookUp")]
    public class LookUp
    {
        [Key]
        public long lookUpId { get; set; }

        public string? lookUpName { get; set; }

        public string? lookUpType { get; set; } // Database mein NULL dikh raha hai

        public string? LUDSType { get; set; }

        public string? ValueField { get; set; }

        public string? TextField { get; set; }
    }
}