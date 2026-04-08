using api.Models;
using api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json; // Case-sensitivity handle karne ke liye

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookUpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LookUpController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/LookUp
        // Sirf lookUpId aur lookUpName fetch karne ke liye
        [HttpGet]
        public async Task<IActionResult> GetAllLookUps()
        {
            try 
            {
                // Database se saari fields fetch karne ki jagah sirf required fields select karein
                var data = await _context.LookUp
                    .Select(l => new {
                        l.lookUpId,    // ID jo backend save hogi
                        l.lookUpName   // Name jo UI dropdown mein dikhega
                    })
                    .ToListAsync();

                // Frontend camelCase expect karta hai, isliye options set karein
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                return new JsonResult(data, options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server side error", error = ex.Message });
            }
        }

        // GET: api/LookUp/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLookUpById(int id)
        {
            try
            {
                var lookUp = await _context.LookUp
                    .Select(l => new { l.lookUpId, l.lookUpName })
                    .FirstOrDefaultAsync(l => l.lookUpId == id);

                if (lookUp == null)
                {
                    return NotFound(new { message = "Lookup record not found" });
                }

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                return new JsonResult(lookUp, options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching lookup", error = ex.Message });
            }
        }
    }
}