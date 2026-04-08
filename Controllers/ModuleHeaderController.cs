using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/module-headers")]
    public class ModuleHeaderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ModuleHeaderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.ModuleHeader
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.Sequence)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _context.ModuleHeader
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (record == null) return NotFound("Module Header not found.");
            return Ok(record);
        }

        [HttpPost("manage")]
        public async Task<IActionResult> Manage([FromBody] ModuleHeaderDto model)
        {
            if (model == null) return BadRequest("Invalid request.");

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newEntry = new ModuleHeader
                    {
                        Header = model.Header,
                        Sequence = model.Sequence,
                        IsDeleted = false
                    };
                    _context.ModuleHeader.Add(newEntry);
                    await _context.SaveChangesAsync();
                    return Ok(newEntry);

                case 'E': // EDIT
                    if (model.Id == null) return BadRequest("Id is required for editing.");
                    var existing = await _context.ModuleHeader
                        .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                    if (existing == null) return NotFound("Record not found.");

                    existing.Header = model.Header;
                    existing.Sequence = model.Sequence;

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': // DELETE (Soft Delete)
                    if (model.Id == null) return BadRequest("Id is required for deletion.");
                    var toDelete = await _context.ModuleHeader
                        .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Record not found.");

                    toDelete.IsDeleted = true;
                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Module Header deleted successfully" });

                default:
                    return BadRequest("Invalid Mode. Use 'A', 'E', or 'D'.");
            }
        }
    }
}