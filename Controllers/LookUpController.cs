using api.Models;
using api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json; 

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

        [HttpGet]
        public async Task<IActionResult> GetAllLookUps()
        {
            try 
            {
    
                var data = await _context.LookUp
                    .Select(l => new {
                        l.lookUpId,
                        l.lookUpName
                    })
                    .ToListAsync();

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                return new JsonResult(data, options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server side error", error = ex.Message });
            }
        }

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