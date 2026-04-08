using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using api.Data;

var builder = WebApplication.CreateBuilder(args);

// 🔹 DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// 🔹 JWT Authentication
builder.Services.AddAuthentication("Bearer")
.AddJwtBearer("Bearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
        ),
        ClockSkew = TimeSpan.Zero
    };
});

// 🔹 Swagger (minimal)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔹 Middleware
// app.UseCors(x => x
//     //.AllowAnyOrigin()
//     .WithOrigins("http://localhost:5294")
//     .AllowAnyMethod()
//     .AllowAnyHeader()
//     .AllowCredentials()
// );

// 🔹 Middleware section
// 🔹 Middleware section update
app.UseCors(x => x
    .WithOrigins( 
        "http://localhost:5173",
        "http://dynamicconfigurator.rs-apps.online",
        "http://dynamicconfigurator",
        "https://dynamicconfigurator", 
        "http://207.180.252.242",
        "https://rs-apps.online"       
    ) 
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials() 
);

// 🔹 Swagger middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("MyCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
