using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/modules")]
    public class ModuleMstController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ModuleMstController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.ModuleMst
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.Sequence)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _context.ModuleMst
                .FirstOrDefaultAsync(x => x.id == id && !x.IsDeleted);

            if (record == null) return NotFound("Module not found.");
            return Ok(record);
        }

  
        [HttpPost("manage")]
        public async Task<IActionResult> Manage([FromBody] ModuleMstDto model)
        {
            if (model == null) return BadRequest("Invalid request.");

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newModule = new ModuleMst
                    {
                        ModuleName = model.ModuleName,
                        icon = model.icon,
                        Status = model.Status ?? "Active", // Default 'Active' agar null ho
                        Link = model.Link,
                        Sequence = model.Sequence,
                        HeaderId = model.HeaderId,
                        IsDeleted = false
                    };
                    _context.ModuleMst.Add(newModule);
                    await _context.SaveChangesAsync();
                    return Ok(newModule);

                case 'E': // EDIT
                    if (model.id == null) return BadRequest("id is required for editing.");
                    var existing = await _context.ModuleMst
                        .FirstOrDefaultAsync(x => x.id == model.id && !x.IsDeleted);

                    if (existing == null) return NotFound("Module not found.");

                    existing.ModuleName = model.ModuleName;
                    existing.icon = model.icon;
                    existing.Status = model.Status;
                    existing.Link = model.Link;
                    existing.Sequence = model.Sequence;
                    existing.HeaderId = model.HeaderId;

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': // DELETE (Soft Delete)
                    if (model.id == null) return BadRequest("id is required for deletion.");
                    var toDelete = await _context.ModuleMst
                        .FirstOrDefaultAsync(x => x.id == model.id && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Module not found.");

                    toDelete.IsDeleted = true;
                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Module deleted successfully" });

                default:
                    return BadRequest("Invalid Mode. Use 'A', 'E', or 'D'.");
            }
        }
    }
}