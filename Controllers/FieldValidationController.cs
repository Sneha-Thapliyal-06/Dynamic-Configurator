using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/field-validation")]
    public class FieldValidationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FieldValidationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.FieldValidation
                .Where(x => !x.IsDeleted)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var record = await _context.FieldValidation
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (record == null)
                return NotFound($"Validation record with ID {id} not found.");

            return Ok(record);
        }

        [HttpPost("manage")]
        public async Task<IActionResult> Manage([FromBody] FieldValidationDto model)
        {
            if (model == null) return BadRequest("Invalid request body.");

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newEntry = new FieldValidation
                    {
                        GroupID = model.GroupID,
                        FieldID = model.FieldID,
                        Validation = model.Validation,
                        Value = model.Value,
                        Status = model.Status,
                        //ErrorMessage = model.ErrorMessage,
                        IsDeleted = false
                    };
                    _context.FieldValidation.Add(newEntry);
                    await _context.SaveChangesAsync();
                    return Ok(newEntry);

                case 'E': // EDIT
                    if (model.Id == null) return BadRequest("Id is required for editing.");
                    
                    var existing = await _context.FieldValidation
                        .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                    if (existing == null) return NotFound("Record not found.");

                    existing.GroupID = model.GroupID;
                    existing.FieldID = model.FieldID;
                    existing.Validation = model.Validation;
                    existing.Value = model.Value;
                    existing.Status = model.Status;
                    //existing.ErrorMessage = model.ErrorMessage;

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': // DELETE (Soft Delete)
                    if (model.Id == null) return BadRequest("Id is required for deletion.");

                    var toDelete = await _context.FieldValidation
                        .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Record not found.");

                    toDelete.IsDeleted = true;
                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Validation deleted successfully", Id = model.Id });

                default:
                    return BadRequest("Invalid Mode. Use 'A', 'E', or 'D'.");
            }
        }
    }
}