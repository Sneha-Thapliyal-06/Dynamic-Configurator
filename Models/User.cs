using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Employee_Mst")]
    public class User
    {
        [Key]
        public long ID { get; set; }

        [Required]
        [StringLength(100)]
        public string EmpName { get; set; } = null!;   // Username

        [Required]
        public string Password { get; set; } = null!; // 🔐 Hashed password

        [StringLength(150)]
        public string? Email_Work { get; set; }

        public bool IsActive { get; set; }   // 1 = Active, 0 = Inactive
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
    }
}
