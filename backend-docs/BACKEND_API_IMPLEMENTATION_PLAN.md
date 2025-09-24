# SalesTracker CRM Backend API Implementation Plan

## Executive Summary

This document provides a comprehensive implementation roadmap for building the SalesTracker CRM backend REST API. Based on analysis of 73 endpoints across 11 modules, complete PostgreSQL database schema, and existing React frontend architecture, this plan delivers a production-ready .NET 9.0.304 backend implementation strategy.

**Key Implementation Scope:**
- 73 REST API endpoints across 11 functional modules
- .NET 9.0.304 with ASP.NET Core Web API and JWT authentication
- PostgreSQL database with Redis caching using Entity Framework Core
- Real-time features via SignalR
- AWS S3 file storage integration
- Comprehensive testing and documentation

---

## Table of Contents

1. [Technology Stack & Architecture](#technology-stack--architecture)
2. [Project Structure Framework](#project-structure-framework)
3. [Priority-Based Implementation Roadmap](#priority-based-implementation-roadmap)
4. [Module-by-Module Implementation Guide](#module-by-module-implementation-guide)
5. [Authentication & Security Framework](#authentication--security-framework)
6. [Database Integration Strategy](#database-integration-strategy)
7. [Real-Time Features Implementation](#real-time-features-implementation)
8. [File Management & Storage](#file-management--storage)
9. [Testing Framework Setup](#testing-framework-setup)
10. [Development Workflow & Standards](#development-workflow--standards)
11. [Deployment & Environment Configuration](#deployment--environment-configuration)

---

## Technology Stack & Architecture

### Core Technology Stack

**Backend Framework:**
```csharp
- .NET 9.0.304 Runtime
- ASP.NET Core 9.0 Web API (Web framework)
- C# 13.0 (Primary language with type safety)
- Microsoft.AspNetCore.Security.Headers (Security headers)
- Microsoft.AspNetCore.Cors (Cross-origin resource sharing)
- Microsoft.AspNetCore.ResponseCompression (Response compression)
```

**Database & Caching:**
```csharp
- PostgreSQL 13+ (Primary database)
- Redis 6+ (Caching & session storage)
- Entity Framework Core 9.0 (ORM with PostgreSQL provider)
- Npgsql.EntityFrameworkCore.PostgreSQL (PostgreSQL provider)
- StackExchange.Redis (Redis client)
- Microsoft.Extensions.Caching.Memory (In-memory caching)
```

**Authentication & Security:**
```csharp
- Microsoft.AspNetCore.Authentication.JwtBearer (JWT tokens)
- Microsoft.AspNetCore.Identity.EntityFrameworkCore (Identity system)
- BCrypt.Net-Next (Password hashing)
- AspNetCoreRateLimit (Rate limiting)
- System.ComponentModel.DataAnnotations (Input validation)
- FluentValidation.AspNetCore (Advanced validation)
- System.Guid (Unique ID generation)
```

**File Storage & Processing:**
```csharp
- AWSSDK.S3 (S3 integration)
- Microsoft.AspNetCore.Http (File upload handling)
- SixLabors.ImageSharp (Image processing)
- Microsoft.AspNetCore.StaticFiles (File type validation)
- System.IO.Abstractions (File system abstraction)
```

**Real-Time & Communication:**
```csharp
- Microsoft.AspNetCore.SignalR (Real-time communication)
- MailKit (Email sending - cross-platform)
- Microsoft.Extensions.Hosting (Background services)
- Quartz.NET (Advanced job scheduling)
- Hangfire (Background job processing)
```

**Development & Testing:**
```csharp
- EditorConfig + .NET analyzers (Code formatting)
- xUnit (Unit testing)
- Microsoft.AspNetCore.Mvc.Testing (Integration testing)
- Swashbuckle.AspNetCore (Swagger/OpenAPI documentation)
- Serilog (Structured logging)
- Microsoft.Extensions.Logging (Built-in logging)
- FluentAssertions (Test assertions)
- Moq (Mocking framework)
```

### Architecture Patterns

**Layered Architecture:**
```
┌─────────────────────────────┐
│         Controllers         │  ← ASP.NET Core Web API Controllers
├─────────────────────────────┤
│         Services            │  ← Business logic with DI
├─────────────────────────────┤
│        Repositories         │  ← Entity Framework Core
├─────────────────────────────┤
│         Database            │  ← PostgreSQL + Redis
└─────────────────────────────┘
```

**Module Structure:**
```
Each module contains:
- Controllers (HTTP endpoints with routing attributes)
- Services (Business logic with dependency injection)
- Repositories (Entity Framework Core operations)
- DTOs (Data Transfer Objects)
- Validators (FluentValidation)
- Models/Entities (EF Core entity classes)
```

---

## Project Structure Framework

### Recommended Directory Structure

```
SalesTracker.Api/
├── SalesTracker.Api/               # Main Web API project
│   ├── Controllers/                # API Controllers
│   ├── Program.cs                  # Application entry point
│   ├── appsettings.json           # Configuration
│   └── Properties/
├── SalesTracker.Core/              # Business logic layer
│   ├── Entities/                   # Domain entities
│   ├── Interfaces/                 # Service/repository interfaces
│   ├── Services/                   # Business logic services
│   ├── DTOs/                       # Data Transfer Objects
│   └── Validators/                 # FluentValidation validators
├── SalesTracker.Infrastructure/    # Data access layer
│   ├── Data/                       # EF Core DbContext
│   ├── Repositories/               # Repository implementations
│   ├── Configurations/             # EF Core configurations
│   └── Migrations/                 # EF Core migrations
├── SalesTracker.Application/       # Application services
│   ├── Features/                   # Feature-based organization
│   │   ├── Auth/                   # Authentication feature
│   │   │   ├── Commands/           # CQRS commands
│   │   │   ├── Queries/            # CQRS queries
│   │   │   ├── Handlers/           # Command/query handlers
│   │   │   └── DTOs/               # Feature-specific DTOs
│   │   ├── Leads/                  # Lead management
│   │   ├── CrmCore/               # Contacts, companies, deals, products
│   │   ├── Analytics/             # Performance analytics
│   │   ├── Emails/                # Email management
│   │   ├── Routing/               # Lead routing
│   │   ├── Notifications/         # Notification system
│   │   ├── Teams/                 # Team management
│   │   ├── Pos/                   # POS system
│   │   ├── Integrations/          # External integrations
│   │   └── Assistant/             # AI assistant
├── SalesTracker.Shared/            # Shared utilities
│   ├── Constants/                  # Application constants
│   ├── Extensions/                 # Extension methods
│   ├── Helpers/                    # Helper classes
│   └── Exceptions/                 # Custom exceptions
├── SalesTracker.Tests/             # Test projects
│   ├── Unit/                       # Unit tests
│   ├── Integration/                # Integration tests
│   └── Common/                     # Test utilities
└── docker-compose.yml              # Development environment
├── SalesTracker.Api/               # Web API project
│   ├── Middleware/                 # Custom middleware
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   ├── RequestLoggingMiddleware.cs
│   │   └── RateLimitingMiddleware.cs
│   ├── Filters/                    # Action filters
│   │   ├── AuthorizationFilter.cs
│   │   ├── ValidationFilter.cs
│   │   └── PermissionFilter.cs
│   ├── Configuration/              # Service configuration
│   │   ├── DatabaseConfiguration.cs
│   │   ├── AuthenticationConfiguration.cs
│   │   ├── CorsConfiguration.cs
│   │   └── SwaggerConfiguration.cs
│   └── Hubs/                       # SignalR hubs
│       ├── NotificationHub.cs
│       └── ChatHub.cs
├── SalesTracker.Infrastructure/    # Infrastructure services
│   ├── Services/                   # External services
│   │   ├── EmailService.cs
│   │   ├── FileStorageService.cs
│   │   ├── CacheService.cs
│   │   └── External/
│   │       ├── GmailService.cs
│   │       ├── OutlookService.cs
│   │       └── WhatsAppService.cs
│   ├── utils/                     # Utility functions
│   │   ├── constants.js           # Application constants
│   │   ├── helpers.js             # Helper functions
│   │   ├── validators.js          # Custom validators
│   │   ├── formatters.js          # Response formatters
│   │   └── errors.js              # Custom error classes
│   ├── config/                    # Configuration
│   │   ├── database.js            # Database configuration
│   │   ├── redis.js               # Redis configuration
│   │   ├── aws.js                 # AWS configuration
│   │   ├── email.js               # Email configuration
│   │   └── index.js               # Main config loader
│   ├── websocket/                 # WebSocket handlers
│   │   ├── notifications.js       # Real-time notifications
│   │   ├── leads.js               # Lead updates
│   │   ├── deals.js               # Deal pipeline updates
│   │   └── activity.js            # Team activity feed
│   ├── database/                  # Database files
│   │   ├── migrations/            # Database migrations
│   │   ├── seeds/                 # Seed data
│   │   └── schema/                # Schema files (existing)
│   ├── jobs/                      # Background jobs
│   │   ├── email-sync.js          # Email synchronization
│   │   ├── lead-scoring.js        # Lead scoring updates
│   │   ├── analytics-cache.js     # Analytics caching
│   │   └── cleanup.js             # Data cleanup tasks
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server startup
├── tests/                         # Testing files
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   ├── e2e/                       # End-to-end tests
│   └── fixtures/                  # Test data
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   ├── setup/                     # Setup guides
│   └── deployment/                # Deployment guides
├── scripts/                       # Utility scripts
│   ├── migrate.js                 # Database migration
│   ├── seed.js                    # Data seeding
│   └── deploy.js                  # Deployment scripts
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── docker-compose.yml             # Development environment
├── Dockerfile                     # Production container
└── README.md
```

---

## Priority-Based Implementation Roadmap

### Phase 1: Foundation & Critical Features (Weeks 1-2)

**Priority 1 - Core Infrastructure:**
```javascript
// Week 1: Infrastructure Setup
- ✓ Express server with middleware stack
- ✓ PostgreSQL connection with connection pooling
- ✓ Redis integration for caching/sessions
- ✓ JWT authentication system
- ✓ Basic error handling and logging
- ✓ Environment configuration management
- ✓ API documentation setup (Swagger)

// Week 2: Critical Modules (23 endpoints)
- ✓ Authentication Module (6 endpoints)
  - POST /auth/login
  - POST /auth/register  
  - POST /auth/reset-password
  - POST /auth/reset-password/confirm
  - POST /auth/refresh
  - POST /auth/logout

- ✓ Lead Management Core (8 endpoints)
  - GET /leads (with filtering, pagination)
  - POST /leads
  - GET /leads/{id}
  - PUT /leads/{id}
  - DELETE /leads/{id}
  - POST /leads/{id}/activities
  - GET /leads/{id}/activities
  - POST /leads/bulk

- ✓ CRM Core Basics (9 endpoints)
  - GET /contacts, POST /contacts, PUT /contacts/{id}, DELETE /contacts/{id}
  - GET /companies, POST /companies, PUT /companies/{id}, DELETE /companies/{id}
  - GET /deals
```

### Phase 2: Core CRM Features (Weeks 3-4)

**Priority 1 Completion + Priority 2 Start:**
```javascript
// Week 3: CRM Core Completion (remaining 7 endpoints)
- ✓ Deals Management
  - POST /deals
  - GET /deals/{id}
  - PUT /deals/{id}/stage
  - POST /deals/{id}/close

- ✓ Products Management
  - GET /products, POST /products, PUT /products/{id}, DELETE /products/{id}

// Week 4: High Priority Features (27 endpoints)
- ✓ Email Management (7 endpoints)
  - POST /emails/send
  - GET /emails
  - GET /emails/templates
  - POST /emails/templates
  - GET /emails/settings
  - GET /emails/{id}/tracking
  - POST /emails/integrations/{provider}/connect

- ✓ Lead Analytics (4 endpoints from Lead Management)
  - GET /leads/analytics
  - POST /leads/{id}/notes
  - POST /leads/{id}/team
  - GET /leads/export
```

### Phase 3: Advanced Features (Weeks 5-6)

**Priority 2 Completion:**
```javascript
// Week 5: Analytics & Performance (8 endpoints)
- ✓ Performance Analytics
  - GET /analytics/performance/users/{userId}
  - GET /analytics/performance/teams
  - GET /analytics/revenue
  - GET /analytics/funnel
  - GET /analytics/activities
  - GET /analytics/pipeline
  - GET /analytics/leaderboards
  - POST /analytics/reports/custom

// Week 6: Routing & Notifications (12 endpoints)
- ✓ Lead Routing (6 endpoints)
  - GET /routing/unassigned
  - POST /routing/leads/{id}/auto-assign
  - GET /routing/leads/{id}/score
  - GET /routing/rules
  - GET /routing/history
  - POST /routing/rebalance

- ✓ Notifications (6 endpoints)
  - GET /notifications
  - POST /notifications/{id}/read
  - POST /notifications/bulk/read
  - GET /notifications/preferences
  - WS /notifications/live
  - POST /notifications
```

### Phase 4: Remaining Features (Weeks 7-8)

**Priority 3 & 4 - Remaining 23 endpoints:**
```javascript
// Week 7: Team & Integration Management (7 endpoints)
- ✓ Team Management (4 endpoints)
- ✓ Integration Module (3 endpoints)

// Week 8: POS & Assistant (5 endpoints)
- ✓ POS System (3 endpoints)
- ✓ AI Assistant (2 endpoints)

// Final: Real-time Features & WebSocket
- ✓ WebSocket implementation for all real-time features
- ✓ File upload and management system
- ✓ Complete testing coverage
- ✓ Production deployment preparation
```

---

## Module-by-Module Implementation Guide

### 1. Authentication Module Implementation

**File Structure:**
```
src/modules/auth/
├── controllers/
│   └── authController.js
├── services/
│   ├── authService.js
│   ├── tokenService.js
│   └── passwordService.js
├── repositories/
│   ├── userRepository.js
│   └── sessionRepository.js
├── validators/
│   └── authValidators.js
├── routes.js
└── index.js
```

**Core Implementation Example:**

```csharp
// SalesTracker.Api/Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using SalesTracker.Core.Entities;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs.Auth;
using SalesTracker.Shared.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly UserManager<ApplicationUser> _userManager;
    
    public AuthController(
        IAuthService authService, 
        ILogger<AuthController> logger,
        UserManager<ApplicationUser> userManager)
    {
        _authService = authService;
        _logger = logger;
        _userManager = userManager;
    }
    
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Request validation failed", ModelState));
            }
            
            var result = await _authService.LoginAsync(request.Email, request.Password, request.RememberMe);
            
            return Ok(ApiResponse<LoginResponseDto>.Success(result));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning(ex, "Login failed for {Email}", request.Email);
            return StatusCode((int)ex.StatusCode, ApiResponse<object>.Error(ex.Code, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<RegisterResponseDto>>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Request validation failed", ModelState));
            }
            
            var result = await _authService.RegisterAsync(request);
            
            return CreatedAtAction(nameof(GetProfile), new { id = result.User.Id }, 
                ApiResponse<RegisterResponseDto>.Success(result));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning(ex, "Registration failed for {Email}", request.Email);
            return StatusCode((int)ex.StatusCode, ApiResponse<object>.Error(ex.Code, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Request validation failed", ModelState));
            }
            
            await _authService.ResetPasswordAsync(request.Email);
            
            return Ok(ApiResponse<object>.Success(null, "Password reset email sent"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpPost("reset-password/confirm")]
    public async Task<ActionResult<ApiResponse<object>>> ConfirmResetPassword([FromBody] ConfirmResetPasswordRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Request validation failed", ModelState));
            }
            
            await _authService.ConfirmResetPasswordAsync(request.Email, request.Token, request.NewPassword);
            
            return Ok(ApiResponse<object>.Success(null, "Password reset successfully"));
        }
        catch (BusinessException ex)
        {
            return StatusCode((int)ex.StatusCode, ApiResponse<object>.Error(ex.Code, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming password reset");
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<RefreshTokenResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(ApiResponse<RefreshTokenResponseDto>.Success(result));
        }
        catch (BusinessException ex)
        {
            return StatusCode((int)ex.StatusCode, ApiResponse<object>.Error(ex.Code, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        try
        {
            var jti = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            var userId = Guid.Parse(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            
            await _authService.LogoutAsync(userId, jti!);
            
            return Ok(ApiResponse<object>.Success(null, "Logged out successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
    
    [HttpGet("profile/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile(Guid id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Error("USER_NOT_FOUND", "User not found"));
            }
            
            var profile = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            };
            
            return Ok(ApiResponse<UserProfileDto>.Success(profile));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile {UserId}", id);
            return StatusCode(500, ApiResponse<object>.Error("INTERNAL_ERROR", "An unexpected error occurred"));
        }
    }
}
```

```csharp
// SalesTracker.Core/Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SalesTracker.Core.Entities;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs.Auth;
using SalesTracker.Shared.Exceptions;
using System.Security.Claims;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;
    private readonly IConfiguration _configuration;
    
    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IEmailService emailService,
        ILogger<AuthService> logger,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }
    
    public async Task<LoginResponseDto> LoginAsync(string email, string password, bool rememberMe = false)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || user.DeletedAt.HasValue)
        {
            throw new BusinessException("Invalid email or password", System.Net.HttpStatusCode.Unauthorized, "INVALID_CREDENTIALS");
        }
        
        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        
        if (result.IsLockedOut)
        {
            _logger.LogWarning("Account locked out for user {Email}", email);
            throw new BusinessException("Account is temporarily locked due to too many failed attempts", 
                System.Net.HttpStatusCode.Forbidden, "ACCOUNT_LOCKED");
        }
        
        if (!result.Succeeded)
        {
            _logger.LogWarning("Invalid login attempt for user {Email}", email);
            throw new BusinessException("Invalid email or password", System.Net.HttpStatusCode.Unauthorized, "INVALID_CREDENTIALS");
        }
        
        // Check if user account is active
        if (user.Status != UserStatus.Active)
        {
            throw new BusinessException("Account is not active", System.Net.HttpStatusCode.Forbidden, "ACCOUNT_INACTIVE");
        }
        
        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        
        // Generate tokens
        var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user);
        
        // Get user permissions
        var permissions = await GetUserPermissionsAsync(user);
        
        var userResponse = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            Permissions = permissions,
            AvatarUrl = user.AvatarUrl,
            TeamId = user.TeamId,
            Status = user.Status,
            CreatedAt = user.CreatedAt
        };
        
        return new LoginResponseDto
        {
            User = userResponse,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = int.Parse(_configuration["Jwt:ExpiryMinutes"]) * 60 // Convert to seconds
        };
    }
    
    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new BusinessException("Email already registered", System.Net.HttpStatusCode.Conflict, "EMAIL_EXISTS");
        }
        
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            UserName = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role ?? "sales_rep",
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = false
        };
        
        var result = await _userManager.CreateAsync(user, request.Password);
        
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessException($"User creation failed: {errors}", 
                System.Net.HttpStatusCode.BadRequest, "USER_CREATION_FAILED");
        }
        
        // Assign default permissions
        var permissions = GetDefaultPermissions(user.Role);
        user.Permissions = permissions;
        await _userManager.UpdateAsync(user);
        
        // Send verification email
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await _emailService.SendEmailConfirmationAsync(user.Email, user.Id, token);
        
        // Generate initial access token
        var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
        
        return new RegisterResponseDto
        {
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                EmailVerified = false
            },
            AccessToken = accessToken,
            RequiresVerification = true
        };
    }
    
    public async Task ResetPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || user.DeletedAt.HasValue)
        {
            // Don't reveal if user exists for security
            _logger.LogWarning("Password reset requested for non-existent user {Email}", email);
            return;
        }
        
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        await _emailService.SendPasswordResetAsync(email, token);
        
        _logger.LogInformation("Password reset email sent to {Email}", email);
    }
    
    public async Task ConfirmResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            throw new BusinessException("Invalid reset request", System.Net.HttpStatusCode.BadRequest, "INVALID_TOKEN");
        }
        
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessException($"Password reset failed: {errors}", 
                System.Net.HttpStatusCode.BadRequest, "PASSWORD_RESET_FAILED");
        }
        
        _logger.LogInformation("Password reset successfully for user {Email}", email);
    }
    
    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // Implementation would validate refresh token and generate new access token
        throw new NotImplementedException("Refresh token functionality to be implemented");
    }
    
    public async Task LogoutAsync(Guid userId, string jti)
    {
        // Blacklist the current token
        var expiryTime = TimeSpan.FromMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"]));
        await _tokenService.BlacklistTokenAsync(jti, expiryTime);
        
        _logger.LogInformation("User {UserId} logged out successfully", userId);
    }
    
    private async Task<List<string>> GetUserPermissionsAsync(ApplicationUser user)
    {
        if (user.Permissions?.Any() == true)
        {
            return user.Permissions;
        }
        
        return GetDefaultPermissions(user.Role);
    }
    
    private static List<string> GetDefaultPermissions(string role)
    {
        return role.ToLower() switch
        {
            "admin" => new List<string> { "*" }, // Full access
            "manager" => new List<string> 
            { 
                "leads:*", "contacts:*", "deals:*", "analytics:read", "teams:read" 
            },
            "sales_rep" => new List<string> 
            { 
                "leads:read", "leads:write", "contacts:read", "contacts:write", 
                "deals:read", "deals:write" 
            },
            _ => new List<string> { "leads:read", "contacts:read" }
        };
    }
}
```

**Route Configuration:**

Routes in ASP.NET Core are configured using controller attributes and dependency injection:

```csharp
// SalesTracker.Api/Program.cs - Route configuration
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers(options =>
{
    // Add custom filters
    options.Filters.Add<ValidationFilter>();
    options.Filters.Add<ExceptionHandlingFilter>();
});

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("AuthPolicy", context =>
        RateLimitPartition.CreateFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15)
            }));
    
    options.AddPolicy("ResetPasswordPolicy", context =>
        RateLimitPartition.CreateFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(15)
            }));
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Rate Limiting Middleware:**

```csharp
// SalesTracker.Api/Filters/RateLimitFilter.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.RateLimiting;

public class RateLimitAttribute : Attribute, IFilterFactory
{
    private readonly string _policyName;
    
    public RateLimitAttribute(string policyName)
    {
        _policyName = policyName;
    }
    
    public bool IsReusable => false;
    
    public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
    {
        return new EnableRateLimitingAttribute(_policyName);
    }
}

// Usage on controller actions:
// [RateLimit("AuthPolicy")]
// [RateLimit("ResetPasswordPolicy")]
```

### 2. Lead Management Module Implementation

**Advanced Lead Management with AI Scoring:**

```csharp
// SalesTracker.Core/Services/LeadService.cs
using Microsoft.Extensions.Logging;
using SalesTracker.Core.Entities;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs.Leads;
using SalesTracker.Shared.Exceptions;
using AutoMapper;
using System.Text.RegularExpressions;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly ILeadScoringService _leadScoringService;
    private readonly ILeadRoutingService _leadRoutingService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<LeadService> _logger;
    private readonly IMapper _mapper;

    public LeadService(
        ILeadRepository leadRepository,
        IActivityRepository activityRepository,
        ILeadScoringService leadScoringService,
        ILeadRoutingService leadRoutingService,
        INotificationService notificationService,
        ILogger<LeadService> logger,
        IMapper mapper)
    {
        _leadRepository = leadRepository;
        _activityRepository = activityRepository;
        _leadScoringService = leadScoringService;
        _leadRoutingService = leadRoutingService;
        _notificationService = notificationService;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<PagedResult<LeadDto>> GetLeadsAsync(LeadFiltersDto filters, PaginationDto pagination, Guid userId, string userRole)
    {
        // Apply permission-based filtering
        if (userRole.Equals("sales_rep", StringComparison.OrdinalIgnoreCase))
        {
            filters.AssignedTo = userId;
        }

        var leads = await _leadRepository.FindWithFiltersAsync(filters, pagination);
        
        // Calculate aggregations
        var aggregations = await _leadRepository.GetAggregationsAsync(filters, userId, userRole);
        
        var leadDtos = _mapper.Map<List<LeadDto>>(leads.Data);

        return new PagedResult<LeadDto>
        {
            Data = leadDtos,
            Pagination = leads.Pagination,
            Aggregations = aggregations
        };
    }

    public async Task<CreateLeadResponseDto> CreateLeadAsync(CreateLeadDto leadData, Guid userId)
    {
        // Validate and clean data
        var cleanedData = CleanLeadData(leadData);
        
        // Check for duplicates
        var existingLead = await _leadRepository.FindByEmailOrPhoneAsync(cleanedData.Email, cleanedData.Phone);
        if (existingLead != null)
        {
            throw new BusinessException("Lead with this email or phone already exists", 
                System.Net.HttpStatusCode.Conflict, "LEAD_DUPLICATE");
        }

        // Calculate lead score
        var leadScore = await _leadScoringService.CalculateScoreAsync(cleanedData);
        cleanedData.LeadScore = leadScore.OverallScore;
        cleanedData.QualityGrade = leadScore.Grade;
        cleanedData.AiInsights = leadScore.Insights;

        // Auto-assign if not manually assigned
        LeadRoutingResult? routingResult = null;
        if (!cleanedData.AssignedTo.HasValue)
        {
            routingResult = await _leadRoutingService.AutoAssignAsync(cleanedData);
            if (routingResult.Success && routingResult.Assignee != null)
            {
                cleanedData.AssignedTo = routingResult.Assignee.Id;
                cleanedData.RoutingData = routingResult;
            }
        }

        // Map to entity
        var lead = _mapper.Map<Lead>(cleanedData);
        lead.Id = Guid.NewGuid();
        lead.CreatedBy = userId;
        lead.CreatedAt = DateTime.UtcNow;

        // Create lead
        var newLead = await _leadRepository.CreateAsync(lead);

        // Create initial activity
        var initialActivity = new Activity
        {
            Id = Guid.NewGuid(),
            LeadId = newLead.Id,
            Type = "note",
            Description = "Lead created",
            UserId = userId,
            Metadata = new Dictionary<string, object>
            {
                ["initial_score"] = leadScore.OverallScore,
                ["source"] = cleanedData.Source
            },
            CreatedAt = DateTime.UtcNow
        };
        
        await _activityRepository.CreateAsync(initialActivity);

        // Send notifications if assigned
        if (newLead.AssignedTo.HasValue && newLead.AssignedTo.Value != userId)
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                RecipientId = newLead.AssignedTo.Value,
                Type = "lead_assigned",
                Title = "New Lead Assigned",
                Message = $"You have been assigned a new lead: {newLead.CompanyName}",
                Data = new Dictionary<string, object> 
                { 
                    ["lead_id"] = newLead.Id,
                    ["lead_name"] = newLead.CompanyName,
                    ["company"] = newLead.CompanyName
                }
            });
        }

        return new CreateLeadResponseDto
        {
            Lead = _mapper.Map<LeadDto>(newLead),
            LeadScore = leadScore,
            RoutingRecommendation = routingResult,
            Notifications = new LeadNotificationStatusDto
            {
                AssigneeNotified = newLead.AssignedTo.HasValue,
                RoutingApplied = routingResult != null
            }
        };
    }

    public async Task<UpdateLeadResponseDto> UpdateLeadAsync(Guid leadId, UpdateLeadDto updateData, Guid userId)
    {
        var existingLead = await _leadRepository.GetByIdAsync(leadId);
        if (existingLead == null)
        {
            throw new BusinessException("Lead not found", System.Net.HttpStatusCode.NotFound, "LEAD_NOT_FOUND");
        }

        // Track changes for audit trail
        var changes = TrackChanges(existingLead, updateData);
        
        // Map updates to entity
        _mapper.Map(updateData, existingLead);
        existingLead.UpdatedBy = userId;
        existingLead.UpdatedAt = DateTime.UtcNow;
        
        // Update lead
        var updatedLead = await _leadRepository.UpdateAsync(existingLead);

        // Generate activities for significant changes
        var activities = await GenerateChangeActivitiesAsync(changes, leadId, userId);

        // Recalculate score if relevant fields changed
        if (ShouldRecalculateScore(changes))
        {
            var newScore = await _leadScoringService.CalculateScoreAsync(updatedLead);
            await _leadRepository.UpdateScoreAsync(leadId, newScore.OverallScore, newScore.Grade);
        }

        // Handle status change business logic
        if (changes.ContainsKey("Status"))
        {
            await HandleStatusChangeAsync(updatedLead, changes["Status"], userId);
        }

        return new UpdateLeadResponseDto
        {
            Lead = _mapper.Map<LeadDto>(updatedLead),
            Changes = changes,
            GeneratedActivities = _mapper.Map<List<ActivityDto>>(activities)
        };
    }

    public async Task<ActivityDto> AddActivityAsync(Guid leadId, CreateActivityDto activityData, Guid userId)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId);
        if (lead == null)
        {
            throw new BusinessException("Lead not found", System.Net.HttpStatusCode.NotFound, "LEAD_NOT_FOUND");
        }

        // Map to entity
        var activity = _mapper.Map<Activity>(activityData);
        activity.Id = Guid.NewGuid();
        activity.LeadId = leadId;
        activity.UserId = userId;
        activity.CreatedAt = DateTime.UtcNow;

        // Create activity
        var createdActivity = await _activityRepository.CreateAsync(activity);

        // Update lead metrics will be handled by database triggers
        
        return _mapper.Map<ActivityDto>(createdActivity);
    }

    // Helper methods
    private CreateLeadDto CleanLeadData(CreateLeadDto data)
    {
        return new CreateLeadDto
        {
            CompanyName = data.CompanyName?.Trim(),
            ContactName = data.ContactName?.Trim(),
            Email = data.Email?.ToLowerInvariant().Trim(),
            Phone = Regex.Replace(data.Phone ?? "", @"\D", ""), // Remove non-digits
            Location = data.Location?.Trim(),
            Source = data.Source,
            Language = data.Language ?? "english",
            ProductInterest = data.ProductInterest?.Trim(),
            DealValue = data.DealValue ?? 0,
            AssignedTo = data.AssignedTo,
            Tags = data.Tags ?? new List<string>(),
            Notes = data.Notes?.Trim(),
            CustomFields = data.CustomFields ?? new Dictionary<string, object>()
        };
    }

    private Dictionary<string, string> TrackChanges(Lead oldData, UpdateLeadDto newData)
    {
        var changes = new Dictionary<string, string>();
        var significantFields = new[] { "Status", "AssignedTo", "DealValue", "Source" };
        
        foreach (var field in significantFields)
        {
            var oldValue = GetPropertyValue(oldData, field);
            var newValue = GetPropertyValue(newData, field);
            
            if (newValue != null && !Equals(oldValue, newValue))
            {
                changes[field] = $"{oldValue} → {newValue}";
            }
        }
        
        return changes;
    }

    private async Task<List<Activity>> GenerateChangeActivitiesAsync(Dictionary<string, string> changes, Guid leadId, Guid userId)
    {
        var activities = new List<Activity>();
        
        foreach (var (field, change) in changes)
        {
            if (field == "Status")
            {
                var activity = new Activity
                {
                    Id = Guid.NewGuid(),
                    LeadId = leadId,
                    Type = "status_change",
                    Description = $"Status changed: {change}",
                    UserId = userId,
                    Metadata = new Dictionary<string, object> { ["field"] = field, ["change"] = change },
                    CreatedAt = DateTime.UtcNow
                };
                
                activities.Add(await _activityRepository.CreateAsync(activity));
            }
            // Add more activity types for different changes
        }
        
        return activities;
    }

    private bool ShouldRecalculateScore(Dictionary<string, string> changes)
    {
        var scoringFields = new[] { "DealValue", "Source", "ProductInterest", "Location" };
        return scoringFields.Any(field => changes.ContainsKey(field));
    }

    private async Task HandleStatusChangeAsync(Lead lead, string statusChange, Guid userId)
    {
        var parts = statusChange.Split(" → ");
        if (parts.Length != 2) return;
        
        var newStatus = parts[1];
        
        if (newStatus.Equals("Won", StringComparison.OrdinalIgnoreCase))
        {
            await HandleWonLeadAsync(lead, userId);
        }
        else if (newStatus.Equals("Lost", StringComparison.OrdinalIgnoreCase))
        {
            await HandleLostLeadAsync(lead, userId);
        }
    }

    private async Task HandleWonLeadAsync(Lead lead, Guid userId)
    {
        // Handle won lead logic
        _logger.LogInformation("Lead {LeadId} marked as won", lead.Id);
        // Additional business logic for won leads
    }

    private async Task HandleLostLeadAsync(Lead lead, Guid userId)
    {
        // Handle lost lead logic
        _logger.LogInformation("Lead {LeadId} marked as lost", lead.Id);
        // Additional business logic for lost leads
    }

    private static object? GetPropertyValue(object obj, string propertyName)
    {
        return obj?.GetType().GetProperty(propertyName)?.GetValue(obj);
    }
}
```

### 3. CRM Core Module Implementation

**Comprehensive CRM Core with Relationships:**

```csharp
// SalesTracker.Core/Services/ContactService.cs
using Microsoft.Extensions.Logging;
using SalesTracker.Core.Entities;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs.Contacts;
using SalesTracker.Shared.Exceptions;
using AutoMapper;

public class ContactService : IContactService
{
    private readonly IContactRepository _contactRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<ContactService> _logger;
    private readonly IMapper _mapper;
    private readonly IBackgroundJobService _backgroundJobService;

    public ContactService(
        IContactRepository contactRepository,
        ICompanyRepository companyRepository,
        ILogger<ContactService> logger,
        IMapper mapper,
        IBackgroundJobService backgroundJobService)
    {
        _contactRepository = contactRepository;
        _companyRepository = companyRepository;
        _logger = logger;
        _mapper = mapper;
        _backgroundJobService = backgroundJobService;
    }

    public async Task<ContactDto> CreateContactAsync(CreateContactDto contactData, Guid userId)
    {
        // Check for existing contact
        var existing = await _contactRepository.FindByEmailAsync(contactData.Email);
        if (existing != null)
        {
            throw new BusinessException("Contact with this email already exists", 
                System.Net.HttpStatusCode.Conflict, "CONTACT_DUPLICATE");
        }

        // Auto-link to company if email domain matches
        Guid? companyId = contactData.CompanyId;
        if (!companyId.HasValue && !string.IsNullOrEmpty(contactData.Email))
        {
            var emailParts = contactData.Email.Split('@');
            if (emailParts.Length == 2)
            {
                var domain = emailParts[1];
                var matchingCompany = await _companyRepository.FindByDomainAsync(domain);
                if (matchingCompany != null)
                {
                    companyId = matchingCompany.Id;
                }
            }
        }

        // Map to entity
        var contact = _mapper.Map<Contact>(contactData);
        contact.Id = Guid.NewGuid();
        contact.CompanyId = companyId;
        contact.CreatedBy = userId;
        contact.CreatedAt = DateTime.UtcNow;

        // Create contact
        var createdContact = await _contactRepository.CreateAsync(contact);

        // Enrich profile data (background job)
        _backgroundJobService.Enqueue<IContactEnrichmentService>(
            service => service.EnrichContactProfileAsync(createdContact.Id));

        return _mapper.Map<ContactDto>(createdContact);
    }

    public async Task<PagedResult<ContactWithMetricsDto>> GetContactsWithMetricsAsync(ContactFiltersDto filters, PaginationDto pagination)
    {
        var contacts = await _contactRepository.FindWithCompanyAndMetricsAsync(filters, pagination);
        return contacts;
    }

    public async Task<ContactDto> UpdateContactAsync(Guid contactId, UpdateContactDto updateData, Guid userId)
    {
        var existingContact = await _contactRepository.GetByIdAsync(contactId);
        if (existingContact == null)
        {
            throw new BusinessException("Contact not found", System.Net.HttpStatusCode.NotFound, "CONTACT_NOT_FOUND");
        }

        // Map updates
        _mapper.Map(updateData, existingContact);
        existingContact.UpdatedBy = userId;
        existingContact.UpdatedAt = DateTime.UtcNow;

        var updatedContact = await _contactRepository.UpdateAsync(existingContact);
        return _mapper.Map<ContactDto>(updatedContact);
    }

    public async Task<bool> DeleteContactAsync(Guid contactId, Guid userId)
    {
        var contact = await _contactRepository.GetByIdAsync(contactId);
        if (contact == null)
        {
            return false;
        }

        contact.DeletedAt = DateTime.UtcNow;
        contact.DeletedBy = userId;

        await _contactRepository.UpdateAsync(contact);
        return true;
    }

    public async Task<ContactDto?> GetContactByIdAsync(Guid contactId)
    {
        var contact = await _contactRepository.GetByIdAsync(contactId);
        return contact != null ? _mapper.Map<ContactDto>(contact) : null;
    }
}
```

**Deal Pipeline Management:**

```csharp
// SalesTracker.Core/Services/DealService.cs
using Microsoft.Extensions.Logging;
using SalesTracker.Core.Entities;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs.Deals;
using SalesTracker.Shared.Exceptions;
using AutoMapper;

public class DealService : IDealService
{
    private readonly IDealRepository _dealRepository;
    private readonly IProductRepository _productRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<DealService> _logger;
    private readonly IMapper _mapper;
    private readonly IPipelineMetricsService _pipelineMetricsService;

    public DealService(
        IDealRepository dealRepository,
        IProductRepository productRepository,
        IActivityRepository activityRepository,
        INotificationService notificationService,
        ILogger<DealService> logger,
        IMapper mapper,
        IPipelineMetricsService pipelineMetricsService)
    {
        _dealRepository = dealRepository;
        _productRepository = productRepository;
        _activityRepository = activityRepository;
        _notificationService = notificationService;
        _logger = logger;
        _mapper = mapper;
        _pipelineMetricsService = pipelineMetricsService;
    }

    public async Task<DealDto> CreateDealAsync(CreateDealDto dealData, Guid userId)
    {
        // Validate and create company/contact if they don't exist
        var processedData = await ProcessRelatedEntitiesAsync(dealData);
        
        // Map to entity
        var deal = _mapper.Map<Deal>(processedData);
        deal.Id = Guid.NewGuid();
        deal.CreatedBy = userId;
        deal.CreatedAt = DateTime.UtcNow;

        // Create deal
        var createdDeal = await _dealRepository.CreateAsync(deal);

        // Add products if specified
        if (dealData.Products?.Any() == true)
        {
            await AddProductsToDealAsync(createdDeal.Id, dealData.Products);
        }

        // Calculate weighted pipeline value
        await _pipelineMetricsService.UpdatePipelineMetricsAsync();

        return _mapper.Map<DealDto>(createdDeal);
    }

    public async Task<DealDto> UpdateDealStageAsync(Guid dealId, UpdateDealStageDto stageData, Guid userId)
    {
        var deal = await _dealRepository.GetByIdAsync(dealId);
        if (deal == null)
        {
            throw new BusinessException("Deal not found", System.Net.HttpStatusCode.NotFound, "DEAL_NOT_FOUND");
        }

        // Validate stage progression
        if (!IsValidStageProgression(deal.Stage, stageData.Stage))
        {
            throw new BusinessException("Invalid stage progression", 
                System.Net.HttpStatusCode.UnprocessableEntity, "INVALID_STAGE_PROGRESSION");
        }

        var previousStage = deal.Stage;

        // Update deal stage
        deal.Stage = stageData.Stage;
        deal.Probability = stageData.Probability;
        deal.UpdatedBy = userId;
        deal.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(stageData.Reason))
        {
            deal.StageChangeReason = stageData.Reason;
        }

        var updatedDeal = await _dealRepository.UpdateAsync(deal);

        // Generate activity
        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            DealId = dealId,
            Type = "status_change",
            Description = $"Deal stage changed from {previousStage} to {stageData.Stage}",
            UserId = userId,
            Metadata = new Dictionary<string, object>
            {
                ["previous_stage"] = previousStage.ToString(),
                ["new_stage"] = stageData.Stage.ToString(),
                ["reason"] = stageData.Reason ?? ""
            },
            CreatedAt = DateTime.UtcNow
        };

        await _activityRepository.CreateAsync(activity);

        // Send notifications for milestone stages
        if (IsMilestoneStage(stageData.Stage))
        {
            await SendStageNotificationsAsync(updatedDeal, userId);
        }

        return _mapper.Map<DealDto>(updatedDeal);
    }

    public async Task<PagedResult<DealDto>> GetDealsAsync(DealFiltersDto filters, PaginationDto pagination)
    {
        var deals = await _dealRepository.FindWithFiltersAsync(filters, pagination);
        return deals;
    }

    public async Task<DealDto?> GetDealByIdAsync(Guid dealId)
    {
        var deal = await _dealRepository.GetByIdAsync(dealId);
        return deal != null ? _mapper.Map<DealDto>(deal) : null;
    }

    public async Task<bool> DeleteDealAsync(Guid dealId, Guid userId)
    {
        var deal = await _dealRepository.GetByIdAsync(dealId);
        if (deal == null)
        {
            return false;
        }

        deal.DeletedAt = DateTime.UtcNow;
        deal.DeletedBy = userId;

        await _dealRepository.UpdateAsync(deal);
        return true;
    }

    private async Task<CreateDealDto> ProcessRelatedEntitiesAsync(CreateDealDto dealData)
    {
        // Process related entities (company/contact creation if needed)
        // This would involve checking if company/contact exist and creating them if necessary
        return dealData; // Simplified implementation
    }

    private async Task AddProductsToDealAsync(Guid dealId, IEnumerable<DealProductDto> products)
    {
        foreach (var product in products)
        {
            var dealProduct = new DealProduct
            {
                Id = Guid.NewGuid(),
                DealId = dealId,
                ProductId = product.ProductId,
                Quantity = product.Quantity,
                UnitPrice = product.UnitPrice,
                Discount = product.Discount,
                CreatedAt = DateTime.UtcNow
            };

            await _dealRepository.AddProductToDealAsync(dealProduct);
        }
    }

    private static bool IsValidStageProgression(DealStage currentStage, DealStage newStage)
    {
        var stageOrder = new[]
        {
            DealStage.Lead,
            DealStage.Qualified,
            DealStage.Proposal,
            DealStage.Negotiation,
            DealStage.ClosedWon,
            DealStage.ClosedLost
        };

        var currentIndex = Array.IndexOf(stageOrder, currentStage);
        var newIndex = Array.IndexOf(stageOrder, newStage);
        
        // Can always move to closed states or backwards
        if (newStage == DealStage.ClosedWon || newStage == DealStage.ClosedLost || newIndex <= currentIndex)
        {
            return true;
        }
        
        // Can only advance one stage at a time
        return newIndex == currentIndex + 1;
    }

    private static bool IsMilestoneStage(DealStage stage)
    {
        return stage is DealStage.Qualified or DealStage.Proposal or DealStage.ClosedWon or DealStage.ClosedLost;
    }

    private async Task SendStageNotificationsAsync(Deal deal, Guid userId)
    {
        // Send notifications to relevant team members for milestone stages
        _logger.LogInformation("Sending stage notification for deal {DealId} - stage {Stage}", 
            deal.Id, deal.Stage);

        if (deal.AssignedTo.HasValue && deal.AssignedTo.Value != userId)
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                RecipientId = deal.AssignedTo.Value,
                Type = "deal_stage_changed",
                Title = "Deal Stage Updated",
                Message = $"Deal '{deal.Name}' moved to {deal.Stage} stage",
                Data = new Dictionary<string, object>
                {
                    ["deal_id"] = deal.Id,
                    ["deal_name"] = deal.Name,
                    ["new_stage"] = deal.Stage.ToString()
                }
            });
        }
    }
}
```

---

## Authentication & Security Framework

### JWT Authentication Implementation with ASP.NET Core Identity

```csharp
// SalesTracker.Infrastructure/Services/TokenService.cs
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Distributed;
using SalesTracker.Core.Entities;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IDistributedCache _cache;
    
    public TokenService(IConfiguration configuration, IDistributedCache cache)
    {
        _configuration = configuration;
        _cache = cache;
    }
    
    public async Task<string> GenerateAccessTokenAsync(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, 
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                ClaimValueTypes.Integer64)
        };
        
        // Add user permissions as claims
        if (user.Permissions?.Any() == true)
        {
            claims.AddRange(user.Permissions.Select(p => new Claim("permission", p)));
        }
        
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"])),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public async Task<string> GenerateRefreshTokenAsync(ApplicationUser user)
    {
        var refreshToken = Guid.NewGuid().ToString();
        var cacheKey = $"refresh_token:{user.Id}";
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]))
        };
        
        await _cache.SetStringAsync(cacheKey, refreshToken, cacheOptions);
        return refreshToken;
    }
    
    public async Task<bool> IsTokenBlacklistedAsync(string jti)
    {
        var cacheKey = $"blacklist:{jti}";
        var result = await _cache.GetStringAsync(cacheKey);
        return !string.IsNullOrEmpty(result);
    }
    
    public async Task BlacklistTokenAsync(string jti, TimeSpan expiry)
    {
        var cacheKey = $"blacklist:{jti}";
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiry
        };
        
        await _cache.SetStringAsync(cacheKey, "blacklisted", cacheOptions);
    }
}
```

### Authentication Configuration
```csharp
// SalesTracker.Api/Configuration/AuthenticationConfiguration.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SalesTracker.Core.Entities;
using SalesTracker.Infrastructure.Data;

public static class AuthenticationConfiguration
{
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure ASP.NET Core Identity
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            // Password requirements
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            
            // User requirements
            options.User.RequireUniqueEmail = true;
            
            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
            options.Lockout.MaxFailedAccessAttempts = 5;
        })
        .AddEntityFrameworkStores<SalesTrackerDbContext>()
        .AddDefaultTokenProviders();
        
        // Configure JWT authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"])),
                ClockSkew = TimeSpan.Zero
            };
            
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();
                    var jti = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
                    
                    if (!string.IsNullOrEmpty(jti) && await tokenService.IsTokenBlacklistedAsync(jti))
                    {
                        context.Fail("Token is blacklisted");
                    }
                }
            };
        });
        
        // Configure authorization policies
        services.AddAuthorizationBuilder()
            .AddPolicy("RequireAdminRole", policy => policy.RequireRole("admin"))
            .AddPolicy("RequireManagerRole", policy => policy.RequireRole("admin", "manager"))
            .AddPolicy("RequireSalesRole", policy => policy.RequireRole("admin", "manager", "sales_rep"))
            .AddPolicy("RequireLeadPermission", policy => policy.RequireClaim("permission", "leads:read"))
            .AddPolicy("RequireDealPermission", policy => policy.RequireClaim("permission", "deals:read"));
        
        return services;
    }
}
```

### Authorization Attributes and Filters
```csharp
// SalesTracker.Api/Filters/PermissionFilter.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string _permission;
    
    public RequirePermissionAttribute(string permission)
    {
        _permission = permission;
    }
    
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        
        if (!user.Identity?.IsAuthenticated == true)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                success = false,
                error = new { code = "UNAUTHORIZED", message = "Authentication required" }
            });
            return;
        }
        
        var userPermissions = user.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToList();
        
        var hasPermission = userPermissions.Contains(_permission) ||
                           userPermissions.Contains("*") ||
                           userPermissions.Any(p => p.EndsWith(":*") && 
                               _permission.StartsWith(p[..^1]));
        
        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
}
```

### Rate Limiting Configuration

```csharp
// SalesTracker.Api/Configuration/RateLimitConfiguration.cs
using AspNetCoreRateLimit;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using StackExchange.Redis;

public static class RateLimitConfiguration
{
    public static IServiceCollection AddRateLimitingServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure memory cache for rate limiting (can be replaced with Redis)
        services.AddMemoryCache();
        
        // Configure rate limiting
        services.Configure<IpRateLimitOptions>(options =>
        {
            // General API rate limiting
            options.GeneralRules = new List<RateLimitRule>
            {
                new RateLimitRule
                {
                    Endpoint = "*",
                    Period = "1h",
                    Limit = 1000
                },
                new RateLimitRule
                {
                    Endpoint = "*/api/auth/login",
                    Period = "15m",
                    Limit = 5
                },
                new RateLimitRule
                {
                    Endpoint = "*/api/auth/register",
                    Period = "15m", 
                    Limit = 5
                },
                new RateLimitRule
                {
                    Endpoint = "*/api/auth/reset-password",
                    Period = "15m",
                    Limit = 3
                },
                new RateLimitRule
                {
                    Endpoint = "*/api/bulk/*",
                    Period = "1m",
                    Limit = 10
                },
                new RateLimitRule
                {
                    Endpoint = "*/api/upload/*",
                    Period = "1h",
                    Limit = 20
                }
            };
            
            options.RealIpHeader = "X-Real-IP";
            options.ClientIdHeader = "X-ClientId";
            options.HttpStatusCode = 429;
            options.QuotaExceededResponse = new QuotaExceededResponse
            {
                Content = JsonSerializer.Serialize(new
                {
                    success = false,
                    error = new
                    {
                        code = "RATE_LIMIT_EXCEEDED",
                        message = "Rate limit exceeded. Please try again later."
                    }
                }),
                ContentType = "application/json"
            };
        });

        // Configure client rate limiting
        services.Configure<ClientRateLimitOptions>(options =>
        {
            options.GeneralRules = new List<RateLimitRule>
            {
                new RateLimitRule
                {
                    Endpoint = "*",
                    Period = "1h",
                    Limit = 5000
                }
            };
            
            options.ClientRules = new List<ClientRateLimitPolicy>
            {
                new ClientRateLimitPolicy
                {
                    ClientId = "premium-client",
                    Rules = new List<RateLimitRule>
                    {
                        new RateLimitRule
                        {
                            Endpoint = "*",
                            Period = "1h", 
                            Limit = 10000
                        }
                    }
                }
            };
        });

        // Add Redis cache if configured
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "SalesTracker";
            });
            
            services.AddSingleton<IIpPolicyStore, DistributedCacheIpPolicyStore>();
            services.AddSingleton<IRateLimitCounterStore, DistributedCacheRateLimitCounterStore>();
            services.AddSingleton<IClientPolicyStore, DistributedCacheClientPolicyStore>();
        }
        else
        {
            // Use in-memory stores for development
            services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
            services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
            services.AddSingleton<IClientPolicyStore, MemoryCacheClientPolicyStore>();
        }

        services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        
        return services;
    }
    
    public static IApplicationBuilder UseRateLimitingMiddleware(this IApplicationBuilder app)
    {
        app.UseIpRateLimiting();
        app.UseClientRateLimiting();
        
        return app;
    }
}

// Custom rate limiting middleware for specific scenarios
public class CustomRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CustomRateLimitMiddleware> _logger;

    public CustomRateLimitMiddleware(RequestDelegate next, IMemoryCache cache, ILogger<CustomRateLimitMiddleware> logger)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.Request.Path.Value;
        var clientIp = context.Connection.RemoteIpAddress?.ToString();
        
        // Custom rate limiting logic for specific endpoints
        if (endpoint?.Contains("/api/auth") == true)
        {
            var key = $"auth_attempts:{clientIp}";
            var attempts = _cache.GetOrCreate(key, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                return 0;
            });

            if (attempts >= 5)
            {
                context.Response.StatusCode = 429;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    error = new
                    {
                        code = "RATE_LIMIT_EXCEEDED",
                        message = "Too many authentication attempts, please try again in 15 minutes"
                    }
                }));
                return;
            }

            _cache.Set(key, attempts + 1, TimeSpan.FromMinutes(15));
        }

        await _next(context);
    }
}
```

---

## Database Integration Strategy

### Entity Framework Core Configuration

```csharp
// SalesTracker.Infrastructure/Data/SalesTrackerDbContext.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using SalesTracker.Core.Entities;
using Microsoft.AspNetCore.Identity;

public class SalesTrackerDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public SalesTrackerDbContext(DbContextOptions<SalesTrackerDbContext> options) : base(options)
    {
    }
    
    // Core CRM entities
    public DbSet<Lead> Leads { get; set; }
    public DbSet<Contact> Contacts { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Deal> Deals { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<EmailTemplate> EmailTemplates { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }
    public DbSet<FileAttachment> FileAttachments { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure entity relationships and constraints
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SalesTrackerDbContext).Assembly);
        
        // Configure Identity tables with custom names if needed
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("users");
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Email).IsUnique();
        });
        
        // Global query filters for soft delete
        modelBuilder.Entity<Lead>().HasQueryFilter(e => e.DeletedAt == null);
        modelBuilder.Entity<Contact>().HasQueryFilter(e => e.DeletedAt == null);
        modelBuilder.Entity<Company>().HasQueryFilter(e => e.DeletedAt == null);
        modelBuilder.Entity<Deal>().HasQueryFilter(e => e.DeletedAt == null);
        
        // Configure indexes for performance
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => e.CreatedAt);
        });
        
        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.CompanyId);
        });
        
        modelBuilder.Entity<Deal>(entity =>
        {
            entity.HasIndex(e => e.Stage);
            entity.HasIndex(e => e.Value);
            entity.HasIndex(e => e.ExpectedCloseDate);
        });
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Automatically set audit fields
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);
            
        foreach (var entry in entries)
        {
            if (entry.Entity is BaseEntity entity)
            {
                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = DateTime.UtcNow;
                }
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        
        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

### Database Configuration and Connection
```csharp
// SalesTracker.Api/Configuration/DatabaseConfiguration.cs
using Microsoft.EntityFrameworkCore;
using SalesTracker.Infrastructure.Data;
using Npgsql;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        // Configure Entity Framework with PostgreSQL
        services.AddDbContext<SalesTrackerDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly("SalesTracker.Infrastructure");
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);
            });
            
            // Enable sensitive data logging in development
            if (configuration.GetValue<bool>("Logging:EnableSensitiveDataLogging"))
            {
                options.EnableSensitiveDataLogging();
            }
            
            // Enable detailed errors in development
            if (configuration.GetValue<string>("Environment") == "Development")
            {
                options.EnableDetailedErrors();
            }
        });
        
        // Configure connection pooling
        services.AddDbContextPool<SalesTrackerDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        }, poolSize: 128); // Adjust pool size based on expected load
        
        // Configure health checks for database
        services.AddHealthChecks()
            .AddNpgSql(connectionString, name: "postgresql", tags: new[] { "database", "postgresql" });
        
        return services;
    }
    
    public static async Task<IApplicationBuilder> MigrateDatabase(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SalesTrackerDbContext>();
        
        try
        {
            await dbContext.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while migrating the database");
            throw;
        }
        
        return app;
    }
}
```

### Query Builder Implementation

```csharp
// SalesTracker.Infrastructure/Utilities/QueryBuilder.cs
using System.Text;

public class QueryBuilder
{
    private readonly string _table;
    private List<string> _selectFields = new() { "*" };
    private List<string> _whereConditions = new();
    private List<string> _joinConditions = new();
    private List<string> _orderByFields = new();
    private int? _limitValue;
    private int? _offsetValue;
    private List<object> _parameters = new();

    public QueryBuilder(string tableName)
    {
        _table = tableName;
    }

    public QueryBuilder Select(params string[] fields)
    {
        _selectFields = fields.Length > 0 ? fields.ToList() : new List<string> { "*" };
        return this;
    }

    public QueryBuilder Select(IEnumerable<string> fields)
    {
        _selectFields = fields.ToList();
        return this;
    }

    public QueryBuilder Where(string field, object value)
    {
        return Where(field, "=", value);
    }

    public QueryBuilder Where(string field, string operatorSymbol, object value)
    {
        _parameters.Add(value);
        _whereConditions.Add($"{field} {operatorSymbol} ${_parameters.Count}");
        return this;
    }

    public QueryBuilder WhereIn<T>(string field, IEnumerable<T> values)
    {
        var valuesList = values.ToList();
        if (!valuesList.Any())
        {
            return this;
        }

        var placeholders = new List<string>();
        foreach (var value in valuesList)
        {
            _parameters.Add(value);
            placeholders.Add($"${_parameters.Count}");
        }

        _whereConditions.Add($"{field} IN ({string.Join(", ", placeholders)})");
        return this;
    }

    public QueryBuilder WhereNotNull(string field)
    {
        _whereConditions.Add($"{field} IS NOT NULL");
        return this;
    }

    public QueryBuilder WhereNull(string field)
    {
        _whereConditions.Add($"{field} IS NULL");
        return this;
    }

    public QueryBuilder Join(string table, string condition)
    {
        _joinConditions.Add($"JOIN {table} ON {condition}");
        return this;
    }

    public QueryBuilder LeftJoin(string table, string condition)
    {
        _joinConditions.Add($"LEFT JOIN {table} ON {condition}");
        return this;
    }

    public QueryBuilder OrderBy(string field, string direction = "ASC")
    {
        _orderByFields.Add($"{field} {direction.ToUpperInvariant()}");
        return this;
    }

    public QueryBuilder Limit(int count)
    {
        _limitValue = count;
        return this;
    }

    public QueryBuilder Offset(int count)
    {
        _offsetValue = count;
        return this;
    }

    public QueryResult Build()
    {
        var queryBuilder = new StringBuilder();
        queryBuilder.Append($"SELECT {string.Join(", ", _selectFields)} FROM {_table}");

        if (_joinConditions.Any())
        {
            queryBuilder.Append($" {string.Join(" ", _joinConditions)}");
        }

        if (_whereConditions.Any())
        {
            queryBuilder.Append($" WHERE {string.Join(" AND ", _whereConditions)}");
        }

        if (_orderByFields.Any())
        {
            queryBuilder.Append($" ORDER BY {string.Join(", ", _orderByFields)}");
        }

        if (_limitValue.HasValue)
        {
            queryBuilder.Append($" LIMIT {_limitValue.Value}");
        }

        if (_offsetValue.HasValue)
        {
            queryBuilder.Append($" OFFSET {_offsetValue.Value}");
        }

        return new QueryResult
        {
            Query = queryBuilder.ToString(),
            Parameters = _parameters.ToArray()
        };
    }

    public class QueryResult
    {
        public string Query { get; set; } = string.Empty;
        public object[] Parameters { get; set; } = Array.Empty<object>();
    }
}
```

### Repository Pattern Implementation

```javascript
// src/modules/leads/repositories/leadRepository.js
const database = require('../../../services/database');
const QueryBuilder = require('../../../utils/queryBuilder');

class LeadRepository {
  async findWithFilters(filters, pagination) {
    const query = new QueryBuilder('leads')
      .select([
        'id', 'company_name', 'contact_name', 'email', 'phone',
        'location', 'source', 'status', 'language', 'product_interest',
        'deal_value', 'assigned_to', 'tags', 'lead_score', 'quality_grade',
        'created_at', 'updated_at', 'last_activity_at', 'activities_count'
      ])
      .whereNull('deleted_at');

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query.where('status', filters.status);
    }

    if (filters.source && filters.source !== 'all') {
      query.where('source', filters.source);
    }

    if (filters.assignedTo && filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        query.whereNull('assigned_to');
      } else {
        query.where('assigned_to', filters.assignedTo);
      }
    }

    if (filters.search) {
      // Use full-text search
      query.where(`(company_name ILIKE $${query.params.length + 1} OR 
                    contact_name ILIKE $${query.params.length + 1} OR 
                    email ILIKE $${query.params.length + 1})`, `%${filters.search}%`);
    }

    if (filters.minValue) {
      query.where('deal_value', '>=', parseFloat(filters.minValue));
    }

    if (filters.maxValue) {
      query.where('deal_value', '<=', parseFloat(filters.maxValue));
    }

    if (filters.tags && filters.tags.length > 0) {
      query.where('tags && $' + (query.params.length + 1), filters.tags);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const limit = Math.min(parseInt(pagination.limit) || 25, 100);
    const offset = (parseInt(pagination.page) || 1 - 1) * limit;
    query.limit(limit).offset(offset);

    // Execute query
    const { query: sql, params } = query.build();
    const result = await database.query(sql, params);

    // Get total count for pagination
    const countQuery = new QueryBuilder('leads')
      .select(['COUNT(*) as total'])
      .whereNull('deleted_at');
    
    // Apply same filters for count
    // ... (same filter logic but for count query)

    const countResult = await database.query(countQuery.build().query, countQuery.params);
    const total = parseInt(countResult.rows[0].total);

    return {
      data: result.rows,
      pagination: {
        page: parseInt(pagination.page) || 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0
      }
    };
  }

  async create(leadData) {
    const fields = Object.keys(leadData);
    const values = Object.values(leadData);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO leads (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT l.*, 
             u.name as assigned_user_name,
             COUNT(a.id) as activities_count
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN activities a ON l.id = a.lead_id AND a.deleted_at IS NULL
      WHERE l.id = $1 AND l.deleted_at IS NULL
      GROUP BY l.id, u.name
    `;
    
    const result = await database.query(query, [id]);
    return result.rows[0];
  }

  async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE leads 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await database.query(query, [id, ...values]);
    return result.rows[0];
  }

  async getAggregations(filters, userId, userRole) {
    // Build base query with same filters
    const baseQuery = new QueryBuilder('leads')
      .whereNull('deleted_at');

    // Apply permission filters
    if (userRole === 'sales_rep') {
      baseQuery.where('assigned_to', userId);
    }

    // Apply other filters...

    const { query: whereClause, params } = baseQuery.build();
    
    const aggregationQuery = `
      SELECT 
        SUM(deal_value) as total_value,
        ROUND(AVG(deal_value), 2) as average_value,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'won') as won_count,
        COUNT(*) FILTER (WHERE status = 'lost') as lost_count
      FROM (${whereClause.replace('SELECT id, company_name, contact_name, email, phone, location, source, status, language, product_interest, deal_value, assigned_to, tags, lead_score, quality_grade, created_at, updated_at, last_activity_at, activities_count FROM leads', 'SELECT deal_value, status FROM leads')}) as filtered_leads
    `;

    const result = await database.query(aggregationQuery, params);
    return result.rows[0];
  }
}

module.exports = new LeadRepository();
```

---

## Real-Time Features Implementation

### SignalR Hub Implementation

```csharp
// SalesTracker.Api/Hubs/NotificationHub.cs
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SalesTracker.Core.Interfaces;

[Authorize]
public class NotificationHub : Hub
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationHub> _logger;
    private readonly IUserConnectionService _connectionService;
    
    public NotificationHub(
        INotificationService notificationService,
        ILogger<NotificationHub> logger,
        IUserConnectionService connectionService)
    {
        _notificationService = notificationService;
        _logger = logger;
        _connectionService = connectionService;
    }
    
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        
        _logger.LogInformation($"User {userId} connected to NotificationHub");
        
        // Track connected user
        await _connectionService.AddConnectionAsync(userId, Context.ConnectionId);
        
        // Join user to their personal group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
        
        // Join user to role-based groups
        if (userRole != "sales_rep")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "managers");
        }
        
        if (userRole == "admin")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
        }
        
        await base.OnConnectedAsync();
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation($"User {userId} disconnected from NotificationHub");
        
        // Remove connection tracking
        await _connectionService.RemoveConnectionAsync(userId, Context.ConnectionId);
        
        await base.OnDisconnectedAsync(exception);
    }
    
    public async Task JoinLeadGroup(string leadId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"lead:{leadId}");
        _logger.LogDebug($"User {Context.UserIdentifier} joined lead group: {leadId}");
    }
    
    public async Task LeaveLeadGroup(string leadId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lead:{leadId}");
        _logger.LogDebug($"User {Context.UserIdentifier} left lead group: {leadId}");
    }
    
    public async Task JoinDealGroup(string dealId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"deal:{dealId}");
        _logger.LogDebug($"User {Context.UserIdentifier} joined deal group: {dealId}");
    }
    
    public async Task LeaveDealGroup(string dealId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"deal:{dealId}");
        _logger.LogDebug($"User {Context.UserIdentifier} left deal group: {dealId}");
    }
    
    public async Task MarkNotificationRead(Guid notificationId)
    {
        var userId = Guid.Parse(Context.UserIdentifier!);
        await _notificationService.MarkAsReadAsync(notificationId, userId);
        
        // Notify client that notification was marked as read
        await Clients.Caller.SendAsync("NotificationMarkedRead", notificationId);
    }
    
    public async Task GetUnreadNotifications()
    {
        var userId = Guid.Parse(Context.UserIdentifier!);
        var notifications = await _notificationService.GetUnreadNotificationsAsync(userId);
        
        await Clients.Caller.SendAsync("UnreadNotifications", notifications);
    }
}
```

### SignalR Service for Real-time Communication
```csharp
// SalesTracker.Infrastructure/Services/SignalRNotificationService.cs
using Microsoft.AspNetCore.SignalR;
using SalesTracker.Api.Hubs;
using SalesTracker.Core.Interfaces;
using SalesTracker.Core.DTOs;

public class SignalRNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IUserConnectionService _connectionService;
    private readonly ILogger<SignalRNotificationService> _logger;
    
    public SignalRNotificationService(
        IHubContext<NotificationHub> hubContext,
        IUserConnectionService connectionService,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _connectionService = connectionService;
        _logger = logger;
    }
    
    public async Task SendToUserAsync(Guid userId, string eventName, object data)
    {
        await _hubContext.Clients.Group($"user:{userId}").SendAsync(eventName, data);
        _logger.LogDebug($"Sent {eventName} to user {userId}");
    }
    
    public async Task SendToManagersAsync(string eventName, object data)
    {
        await _hubContext.Clients.Group("managers").SendAsync(eventName, data);
        _logger.LogDebug($"Sent {eventName} to managers");
    }
    
    public async Task SendToLeadWatchersAsync(Guid leadId, string eventName, object data)
    {
        await _hubContext.Clients.Group($"lead:{leadId}").SendAsync(eventName, data);
        _logger.LogDebug($"Sent {eventName} to lead {leadId} watchers");
    }
    
    public async Task SendToDealWatchersAsync(Guid dealId, string eventName, object data)
    {
        await _hubContext.Clients.Group($"deal:{dealId}").SendAsync(eventName, data);
        _logger.LogDebug($"Sent {eventName} to deal {dealId} watchers");
    }
    
    public async Task BroadcastSystemNotificationAsync(string eventName, object data)
    {
        await _hubContext.Clients.All.SendAsync(eventName, data);
        _logger.LogDebug($"Broadcast system notification: {eventName}");
    }
}
```

### SignalR Configuration
```csharp
// SalesTracker.Api/Configuration/SignalRConfiguration.cs
using Microsoft.AspNetCore.SignalR;

public static class SignalRConfiguration
{
    public static IServiceCollection AddSignalRServices(this IServiceCollection services)
    {
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.HandshakeTimeout = TimeSpan.FromSeconds(15);
        });
        
        // Register SignalR notification service
        services.AddScoped<IRealtimeNotificationService, SignalRNotificationService>();
        services.AddSingleton<IUserConnectionService, UserConnectionService>();
        
        return services;
    }
}
```

### Real-time Notifications
  async sendNotification(userId, notification) {
    await this.sendToUser(userId, 'notification', {
      notification,
      unreadCount: await this.getUnreadCount(userId)
    });
  }

  // Lead updates
  async broadcastLeadUpdate(leadId, leadData, updateType) {
    await this.sendToLeadWatchers(leadId, 'lead_updated', {
      leadId,
      lead: leadData,
      updateType,
      timestamp: new Date().toISOString()
    });
  }

  // Deal updates
  async broadcastDealUpdate(dealId, dealData, updateType) {
    await this.sendToDealWatchers(dealId, 'deal_updated', {
      dealId,
      deal: dealData,
      updateType,
      timestamp: new Date().toISOString()
    });
  }

  // Team activity feed
  async broadcastTeamActivity(activity) {
    await this.sendToManagers('team_activity', {
      activity,
      timestamp: new Date().toISOString()
    });
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  async handleNotificationRead(userId, notificationId) {
    // Update notification in database
    const notificationService = require('./notification.service');
    await notificationService.markAsRead(notificationId, userId);
    
    // Broadcast to all user's connections
    await this.sendToUser(userId, 'notification_read', {
      notificationId,
      unreadCount: await this.getUnreadCount(userId)
    });
  }

  async getUnreadCount(userId) {
    const notificationService = require('./notification.service');
    return await notificationService.getUnreadCount(userId);
  }
}

module.exports = new WebSocketService();
```

### Real-Time Notification System

```javascript
// src/services/notification.service.js
const database = require('./database');
const websocketService = require('./websocket.service');
const emailService = require('./email.service');

class NotificationService {
  async create(notificationData) {
    const {
      recipient_id,
      type,
      category,
      priority,
      title,
      message,
      data,
      actions,
      expires_at,
      send_channels
    } = notificationData;

    // Create notification in database
    const notification = await database.query(`
      INSERT INTO notifications (
        recipient_id, type, category, priority, title, message, 
        data, actions, expires_at, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `, [
      recipient_id, type, category || 'system', priority || 'medium',
      title, message, JSON.stringify(data || {}), 
      JSON.stringify(actions || []), expires_at
    ]);

    const createdNotification = notification.rows[0];

    // Get user preferences
    const userPrefs = await this.getUserPreferences(recipient_id);
    
    // Send via requested channels
    const channels = send_channels || ['inApp'];
    
    if (channels.includes('inApp')) {
      await this.sendInAppNotification(createdNotification);
    }
    
    if (channels.includes('email') && userPrefs.email_enabled) {
      await this.sendEmailNotification(recipient_id, createdNotification);
    }
    
    if (channels.includes('sms') && userPrefs.sms_enabled) {
      await this.sendSMSNotification(recipient_id, createdNotification);
    }

    return createdNotification;
  }

  async sendInAppNotification(notification) {
    // Send via WebSocket
    await websocketService.sendNotification(notification.recipient_id, notification);
  }

  async sendEmailNotification(userId, notification) {
    const user = await database.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return;

    const { email, name } = user.rows[0];
    
    await emailService.send({
      to: email,
      subject: notification.title,
      template: 'notification',
      data: {
        name,
        title: notification.title,
        message: notification.message,
        actionUrl: this.getNotificationActionUrl(notification)
      }
    });
  }

  async getUserPreferences(userId) {
    const result = await database.query(`
      SELECT preferences->>'notifications' as notification_prefs
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return { email_enabled: true, sms_enabled: false };
    }

    const prefs = JSON.parse(result.rows[0].notification_prefs || '{}');
    return {
      email_enabled: prefs.email !== false,
      sms_enabled: prefs.sms === true
    };
  }

  async markAsRead(notificationId, userId) {
    const result = await database.query(`
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND recipient_id = $2 AND is_read = false
      RETURNING *
    `, [notificationId, userId]);

    return result.rows[0];
  }

  async getUnreadCount(userId) {
    const result = await database.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE recipient_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())
    `, [userId]);

    return parseInt(result.rows[0].count);
  }

  // Automated notification triggers
  async triggerLeadAssignedNotification(leadId, assigneeId, assignedBy) {
    const lead = await database.query('SELECT company_name, contact_name FROM leads WHERE id = $1', [leadId]);
    if (lead.rows.length === 0) return;

    const { company_name, contact_name } = lead.rows[0];

    await this.create({
      recipient_id: assigneeId,
      type: 'lead_assigned',
      category: 'leads',
      priority: 'high',
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${company_name} (${contact_name})`,
      data: {
        lead_id: leadId,
        company_name,
        contact_name,
        assigned_by: assignedBy
      },
      actions: [
        {
          type: 'open_details',
          label: 'View Lead',
          url: `/leads/${leadId}`,
          primary: true
        }
      ],
      send_channels: ['inApp', 'email']
    });
  }

  async triggerDealWonNotification(dealId, userId) {
    const deal = await database.query('SELECT title, value FROM deals WHERE id = $1', [dealId]);
    if (deal.rows.length === 0) return;

    const { title, value } = deal.rows[0];

    await this.create({
      recipient_id: userId,
      type: 'deal_won',
      category: 'deals',
      priority: 'high',
      title: 'Deal Won! 🎉',
      message: `Congratulations! You won the deal "${title}" worth $${value.toLocaleString()}`,
      data: {
        deal_id: dealId,
        title,
        value
      },
      actions: [
        {
          type: 'open_details',
          label: 'View Deal',
          url: `/deals/${dealId}`,
          primary: true
        }
      ],
      send_channels: ['inApp', 'email']
    });

    // Also notify managers
    await this.create({
      recipient_id: 'managers', // Special recipient for broadcasting
      type: 'deal_won',
      category: 'team_performance',
      priority: 'medium',
      title: 'Team Deal Won',
      message: `Team member won deal "${title}" worth $${value.toLocaleString()}`,
      data: { deal_id: dealId, title, value, won_by: userId }
    });
  }
}

module.exports = new NotificationService();
```

---

## File Management & Storage

### AWS S3 Integration Service

```javascript
// src/services/file.service.js
const AWS = require('aws-sdk');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { BusinessError } = require('../utils/errors');

class FileService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucket = process.env.AWS_S3_BUCKET;
    this.cdnUrl = process.env.AWS_CLOUDFRONT_URL;
    
    this.allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BusinessError(`File type ${file.mimetype} not allowed`, 400));
        }
      }
    });
  }

  async uploadFile(file, entityType, entityId, userId) {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;
      const key = `${userId}/${entityType}/${entityId}/${filename}`;

      let uploadBuffer = file.buffer;
      let contentType = file.mimetype;

      // Process images
      if (file.mimetype.startsWith('image/')) {
        uploadBuffer = await this.processImage(file.buffer, file.mimetype);
        
        // Generate thumbnail for images
        const thumbnailBuffer = await this.generateThumbnail(file.buffer);
        const thumbnailKey = `${userId}/${entityType}/${entityId}/thumbnails/${filename}`;
        
        await this.uploadToS3(thumbnailKey, thumbnailBuffer, 'image/jpeg');
      }

      // Upload main file
      const uploadResult = await this.uploadToS3(key, uploadBuffer, contentType);

      // Store file metadata in database
      const fileRecord = await this.storeFileMetadata({
        id: fileId,
        original_name: file.originalname,
        filename: filename,
        s3_key: key,
        size: file.size,
        mime_type: file.mimetype,
        entity_type: entityType,
        entity_id: entityId,
        uploaded_by: userId
      });

      return {
        id: fileId,
        filename: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        url: this.getFileUrl(key),
        thumbnailUrl: file.mimetype.startsWith('image/') ? 
          this.getFileUrl(`${userId}/${entityType}/${entityId}/thumbnails/${filename}`) : null
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new BusinessError('File upload failed', 500);
    }
  }

  async uploadToS3(key, buffer, contentType) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256'
    };

    return await this.s3.upload(params).promise();
  }

  async processImage(buffer, mimeType) {
    // Optimize images
    let processedBuffer = buffer;
    
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 85, progressive: true })
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
    } else if (mimeType === 'image/png') {
      processedBuffer = await sharp(buffer)
        .png({ progressive: true, compressionLevel: 8 })
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
    } else if (mimeType === 'image/webp') {
      processedBuffer = await sharp(buffer)
        .webp({ quality: 85 })
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
    }

    return processedBuffer;
  }

  async generateThumbnail(buffer) {
    return await sharp(buffer)
      .resize(300, 300, { 
        fit: 'cover', 
        position: 'center' 
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  getFileUrl(key) {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(fileId, userId) {
    // Get file record
    const fileRecord = await this.getFileMetadata(fileId);
    if (!fileRecord) {
      throw new BusinessError('File not found', 404);
    }

    // Check permissions
    if (fileRecord.uploaded_by !== userId) {
      // Check if user has admin permissions
      // Implementation depends on your permission system
    }

    // Delete from S3
    await this.s3.deleteObject({
      Bucket: this.bucket,
      Key: fileRecord.s3_key
    }).promise();

    // Delete thumbnail if exists
    if (fileRecord.mime_type.startsWith('image/')) {
      const thumbnailKey = fileRecord.s3_key.replace(`/${fileRecord.filename}`, `/thumbnails/${fileRecord.filename}`);
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: thumbnailKey
      }).promise().catch(() => {}); // Ignore if thumbnail doesn't exist
    }

    // Soft delete in database
    await this.deleteFileMetadata(fileId);

    return { success: true };
  }

  async storeFileMetadata(fileData) {
    const database = require('./database');
    const result = await database.query(`
      INSERT INTO file_uploads (
        id, original_name, filename, s3_key, size, mime_type,
        entity_type, entity_id, uploaded_by, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `, [
      fileData.id, fileData.original_name, fileData.filename, fileData.s3_key,
      fileData.size, fileData.mime_type, fileData.entity_type, fileData.entity_id,
      fileData.uploaded_by
    ]);
    
    return result.rows[0];
  }

  async getFileMetadata(fileId) {
    const database = require('./database');
    const result = await database.query(`
      SELECT * FROM file_uploads 
      WHERE id = $1 AND deleted_at IS NULL
    `, [fileId]);
    
    return result.rows[0];
  }

  async deleteFileMetadata(fileId) {
    const database = require('./database');
    await database.query(`
      UPDATE file_uploads 
      SET deleted_at = NOW() 
      WHERE id = $1
    `, [fileId]);
  }
}

module.exports = new FileService();
```

### File Upload Controller Implementation

```javascript
// src/controllers/fileController.js
const fileService = require('../services/file.service');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/formatters');

class FileController {
  constructor() {
    this.upload = fileService.getMulterConfig();
  }

  async uploadFile(req, res, next) {
    try {
      const { entityType, entityId } = req.body;
      
      if (!req.file) {
        return res.status(400).json(formatErrorResponse('NO_FILE', 'No file provided'));
      }

      if (!entityType || !entityId) {
        return res.status(400).json(formatErrorResponse('MISSING_PARAMS', 'Entity type and ID required'));
      }

      const result = await fileService.uploadFile(
        req.file,
        entityType,
        entityId,
        req.user.id
      );

      res.json(formatSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async uploadMultipleFiles(req, res, next) {
    try {
      const { entityType, entityId } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(formatErrorResponse('NO_FILES', 'No files provided'));
      }

      if (req.files.length > 10) {
        return res.status(400).json(formatErrorResponse('TOO_MANY_FILES', 'Maximum 10 files allowed'));
      }

      const uploadPromises = req.files.map(file => 
        fileService.uploadFile(file, entityType, entityId, req.user.id)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason.message);

      res.json(formatSuccessResponse({
        uploaded: successful,
        failed: failed,
        totalUploaded: successful.length,
        totalFailed: failed.length
      }));
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const { fileId } = req.params;
      
      const result = await fileService.deleteFile(fileId, req.user.id);
      
      res.json(formatSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
```

---

## Testing Framework Setup

### Testing Configuration

```javascript
// package.json - Testing dependencies
{
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.0",
    "@types/jest": "^29.5.0",
    "jest-environment-node": "^29.5.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testMatch='**/integration/**/*.test.js'",
    "test:unit": "jest --testMatch='**/unit/**/*.test.js'"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js",
      "!src/server.js",
      "!src/config/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Unit Testing Examples

```javascript
// tests/unit/services/authService.test.js
const authService = require('../../../src/modules/auth/services/authService');
const userRepository = require('../../../src/modules/auth/repositories/userRepository');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../../src/modules/auth/repositories/userRepository');
jest.mock('bcrypt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: '123',
        email: email,
        password_hash: 'hashedpassword',
        is_active: true,
        name: 'Test User',
        role: 'sales_rep',
        permissions: ['leads:read']
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      userRepository.updateLastLogin.mockResolvedValue();

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(email);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password_hash);
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';

      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, password))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for inactive user', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: '123',
        email: email,
        password_hash: 'hashedpassword',
        is_active: false
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login(email, password))
        .rejects.toThrow('Account is deactivated');
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      userRepository.create.mockResolvedValue({
        id: '123',
        email: userData.email,
        name: userData.name,
        role: 'sales_rep',
        created_at: new Date()
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      userRepository.findByEmail.mockResolvedValue({ id: '456' });

      // Act & Assert
      await expect(authService.register(userData))
        .rejects.toThrow('Email already registered');
    });
  });
});
```

### Integration Testing Examples

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/services/database');

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await database.query('BEGIN');
  });

  afterAll(async () => {
    // Cleanup test database
    await database.query('ROLLBACK');
    await database.close();
  });

  afterEach(async () => {
    // Clean up test data
    await database.query('DELETE FROM users WHERE email LIKE \'%test.com\'');
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'integration@test.com',
        password: 'password123',
        name: 'Integration Test User'
      };

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Duplicate User'
      };

      // Register first user
      await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      // Try to register same email again
      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already registered');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Invalid Email User'
      };

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create test user
      const userData = {
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test User'
      };

      const registerResponse = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      testUser = registerResponse.body.data.user;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid email or password');
    });
  });
});
```

### API Testing Helper

```javascript
// tests/helpers/apiHelper.js
const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

class ApiHelper {
  constructor() {
    this.app = app;
  }

  // Generate test JWT token
  generateTestToken(user = {}) {
    const payload = {
      sub: user.id || 'test-user-id',
      email: user.email || 'test@example.com',
      role: user.role || 'sales_rep',
      permissions: user.permissions || ['leads:read', 'leads:write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
  }

  // Authenticated request helper
  authenticatedRequest(method, url, user = {}) {
    const token = this.generateTestToken(user);
    return request(this.app)[method](url)
      .set('Authorization', `Bearer ${token}`);
  }

  // GET request with auth
  get(url, user = {}) {
    return this.authenticatedRequest('get', url, user);
  }

  // POST request with auth
  post(url, user = {}) {
    return this.authenticatedRequest('post', url, user);
  }

  // PUT request with auth
  put(url, user = {}) {
    return this.authenticatedRequest('put', url, user);
  }

  // DELETE request with auth
  delete(url, user = {}) {
    return this.authenticatedRequest('delete', url, user);
  }

  // Create test lead
  async createTestLead(user = {}, leadData = {}) {
    const defaultLead = {
      companyName: 'Test Company',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '+1234567890',
      source: 'website',
      dealValue: 10000
    };

    const response = await this.post('/v1/leads', user)
      .send({ ...defaultLead, ...leadData })
      .expect(201);

    return response.body.data.lead;
  }

  // Create test user
  async createTestUser(userData = {}) {
    const defaultUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      role: 'sales_rep'
    };

    const response = await request(this.app)
      .post('/v1/auth/register')
      .send({ ...defaultUser, ...userData })
      .expect(201);

    return response.body.data.user;
  }
}

module.exports = new ApiHelper();
```

---

## Development Workflow & Standards

### Environment Configuration

```javascript
// .env.example
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salestracker
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=salestracker-uploads
AWS_CLOUDFRONT_URL=https://cdn.example.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@salestracker.com
FROM_NAME=SalesTracker CRM

# External API Keys
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Monitoring & Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Error prevention
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    
    // Code style
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Async/await
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    
    // Security
    'no-buffer-constructor': 'error'
  }
};
```

### Prettier Configuration

```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git Hooks Setup

```javascript
// package.json - Husky configuration
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### API Documentation with Swagger

```javascript
// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SalesTracker CRM API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for SalesTracker CRM backend',
      contact: {
        name: 'API Support',
        email: 'support@salestracker.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Request validation failed' },
                details: { type: 'array', items: { type: 'object' } }
              }
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                requestId: { type: 'string' }
              }
            }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyName: { type: 'string', example: 'Acme Corp' },
            contactName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@acme.com' },
            phone: { type: 'string', example: '+1234567890' },
            location: { type: 'string', example: 'New York, NY' },
            source: { 
              type: 'string', 
              enum: ['website', 'facebook', 'instagram', 'whatsapp', 'email', 'event', 'manual', 'referral', 'cold_call', 'linkedin'],
              example: 'website'
            },
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'in_progress', 'qualified', 'won', 'lost'],
              example: 'new'
            },
            language: { type: 'string', example: 'english' },
            productInterest: { type: 'string', example: 'Premium Tea Collection' },
            dealValue: { type: 'number', example: 10000 },
            closedValue: { type: 'number', nullable: true },
            assignedTo: { type: 'string', format: 'uuid', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            leadScore: { type: 'integer', minimum: 0, maximum: 100 },
            qualityGrade: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            closedDate: { type: 'string', format: 'date-time', nullable: true }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/modules/*/routes.js', './src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
```

### Logging Configuration

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'salestracker-api' },
  transports: [
    // Write to all logs with level `info` and below to combined.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// If not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

---

## Deployment & Environment Configuration

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the server
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/usr/src/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: salestracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema:/docker-entrypoint-initdb.d
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Production Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t salestracker-api:latest .

# Tag for production
docker tag salestracker-api:latest salestracker-api:prod

# Run database migrations
echo "📊 Running database migrations..."
npm run migrate:prod

# Update production containers
echo "🔄 Updating production services..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Run health check
echo "🏥 Running health check..."
sleep 10
curl -f http://localhost:3001/health || exit 1

# Run smoke tests
echo "🧪 Running smoke tests..."
npm run test:smoke

echo "✅ Deployment completed successfully!"
```

### Database Migration System

```javascript
// scripts/migrate.js
const fs = require('fs').promises;
const path = require('path');
const database = require('../src/services/database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '..', 'src', 'database', 'migrations');
  }

  async run() {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get list of migration files
      const migrationFiles = await this.getMigrationFiles();

      // Get completed migrations
      const completedMigrations = await this.getCompletedMigrations();

      // Filter pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !completedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations');
        return;
      }

      console.log(`Running ${pendingMigrations.length} migrations...`);

      // Run migrations
      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    await database.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
  }

  async getMigrationFiles() {
    const files = await fs.readdir(this.migrationsPath);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  async getCompletedMigrations() {
    const result = await database.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  }

  async runMigration(filename) {
    console.log(`Running migration: ${filename}`);

    const migrationPath = path.join(this.migrationsPath, filename);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    await database.transaction(async (client) => {
      // Execute migration
      await client.query(migrationSQL);

      // Record migration
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
    });

    console.log(`✅ Completed: ${filename}`);
  }
}

// Run migrations if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = MigrationRunner;
```

### Health Check Endpoint

```javascript
// src/routes/health.js
const express = require('express');
const database = require('../services/database');
const redis = require('../services/redis');

const router = express.Router();

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Check database
    await database.query('SELECT 1');
    healthCheck.services.database = 'healthy';
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
  }

  try {
    // Check Redis
    await redis.ping();
    healthCheck.services.redis = 'healthy';
  } catch (error) {
    healthCheck.services.redis = 'unhealthy';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
  healthCheck.services.memory = memUsageMB < 512 ? 'healthy' : 'warning';
  healthCheck.memory = {
    rss: `${memUsageMB}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
  };

  // Determine overall health
  const allHealthy = Object.values(healthCheck.services).every(
    status => status === 'healthy'
  );

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/readiness', async (req, res) => {
  try {
    // More comprehensive readiness check
    await database.query('SELECT COUNT(*) FROM users LIMIT 1');
    await redis.ping();

    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

module.exports = router;
```

---

## Implementation Timeline & Next Steps

### Week-by-Week Implementation Plan

**Week 1-2: Foundation & Critical Authentication**
- ✅ Set up Express server with middleware stack
- ✅ Configure PostgreSQL with connection pooling
- ✅ Implement Redis for caching and sessions
- ✅ Build JWT authentication system
- ✅ Create error handling and logging framework
- ✅ Set up API documentation with Swagger
- ✅ Implement all 6 authentication endpoints

**Week 3-4: Core CRM Features**
- ✅ Complete Lead Management module (12 endpoints)
- ✅ Build CRM Core with contacts, companies, deals, products (16 endpoints)
- ✅ Implement advanced lead scoring and routing algorithms
- ✅ Create activity tracking system
- ✅ Set up file upload and storage with AWS S3

**Week 5-6: Analytics & Communication**
- ✅ Implement Performance Analytics module (8 endpoints)
- ✅ Build Email Management system with external integrations (7 endpoints)
- ✅ Create comprehensive notification system (6 endpoints)
- ✅ Implement WebSocket for real-time features
- ✅ Build lead routing and scoring system (6 endpoints)

**Week 7-8: Final Modules & Production**
- ✅ Complete Team Management (4 endpoints)
- ✅ Build Integration module (3 endpoints)  
- ✅ Implement POS system (3 endpoints)
- ✅ Create AI Assistant module (2 endpoints)
- ✅ Complete testing suite with 95% coverage
- ✅ Production deployment and monitoring setup

### Success Metrics & Validation

**Technical Performance:**
- ✅ Response times < 200ms for simple operations
- ✅ Support for 1000+ concurrent users
- ✅ 99.9% uptime with proper monitoring
- ✅ Comprehensive test coverage (95%+)
- ✅ Zero critical security vulnerabilities

**Business Requirements:**
- ✅ All 73 API endpoints implemented and documented
- ✅ Complete integration with existing React frontend
- ✅ Real-time features working across all modules
- ✅ External API integrations (Gmail, Outlook, social media)
- ✅ Scalable architecture supporting future growth

### Post-Implementation Tasks

**Immediate (Week 9):**
- Performance optimization and caching improvements
- Security audit and penetration testing
- Load testing with realistic data volumes
- Documentation review and API examples
- User acceptance testing with frontend team

**Short-term (Month 2):**
- Advanced analytics features and custom reports  
- Additional email provider integrations
- Enhanced AI-powered lead scoring
- Mobile API optimizations
- Advanced monitoring and alerting

**Medium-term (Month 3-6):**
- Microservices architecture migration planning
- Advanced caching strategies (CDN integration)
- Machine learning integration for predictive analytics
- Advanced workflow automation
- Multi-tenant architecture support

---

## Conclusion

This comprehensive implementation plan provides a complete roadmap for building a production-ready SalesTracker CRM backend API. The plan covers:

✅ **Complete API Coverage**: All 73 endpoints across 11 modules with detailed implementation guidance
✅ **Production Architecture**: Scalable Node.js/Express backend with PostgreSQL and Redis
✅ **Security Best Practices**: JWT authentication, rate limiting, input validation, and data encryption
✅ **Real-Time Features**: WebSocket integration for notifications, lead updates, and team collaboration
✅ **External Integrations**: Email providers, file storage, and social media APIs
✅ **Comprehensive Testing**: Unit, integration, and end-to-end testing with 95% coverage target
✅ **Development Workflow**: Code standards, CI/CD pipeline, and deployment automation
✅ **Monitoring & Maintenance**: Health checks, logging, error tracking, and performance monitoring

The modular architecture and priority-based implementation approach ensures that the most critical features (authentication, lead management, CRM core) are delivered first, providing immediate value while building towards the complete feature set.

This backend implementation will seamlessly integrate with the existing React frontend, providing a robust, scalable foundation for the SalesTracker CRM system that can support thousands of users and millions of records while maintaining high performance and reliability.