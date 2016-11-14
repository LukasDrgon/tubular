﻿using System.Data.Entity;

namespace Unosquare.Tubular.Sample.Models
{
    public class SampleDbContext : DbContext
    {
        public SampleDbContext() : base("SampleDbContext") { }
        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }

        public DbSet<SystemUser> SystemUsers { get; set; }
        public DbSet<SystemRole> SystemRoles { get; set; }
    }
}