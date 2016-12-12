﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using System;
using System.Linq;
using System.Threading.Tasks;
using Unosquare.Tubular.AspNetCoreSample.Models;

namespace Unosquare.Tubular.AspNetCoreSample
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<SampleDbContext>(
                options => options.UseSqlServer(Configuration["ConnectionString"]));

            // Add framework services.
            services.AddMvc()
                // Change the JSON contract resolver to DefaultContractResolver to avoid issues with camel case property
                .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory,
            SampleDbContext dbContext)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMvc();

            #region Seeder

            Task.Factory.StartNew(() =>
            {
                if (dbContext.Orders.Any()) return;
                try
                {
                    var shipperCities = new[]
                    {
                        "Guadalajara, JAL, Mexico", "Los Angeles, CA, USA", "Portland, OR, USA", "Leon, GTO, Mexico",
                        "Boston, MA, USA"
                    };

                    var companies = new[]
                    {
                        "Unosquare LLC", "Advanced Technology Systems", "Super La Playa", "Vesta", "Microsoft", "Oxxo",
                        "Simian"
                    };

                    dbContext.Products.AddRange(new Product {Name = "CocaCola"}, new Product {Name = "Pepsi"},
                        new Product {Name = "Starbucks"}, new Product {Name = "Donut"});

                    dbContext.SaveChanges();

                    var rand = new Random();
                    var products = dbContext.Products.ToArray();

                    for (var i = 0; i < 500; i++)
                    {
                        var order = new Order
                        {
                            //CreatedUserId = users[rand.Next(users.Count - 1)].Id,
                            CustomerName = companies[rand.Next(companies.Length - 1)],
                            IsShipped = rand.Next(10) > 5,
                            ShipperCity = shipperCities[rand.Next(shipperCities.Length - 1)],
                            ShippedDate = DateTime.Now.AddDays(1 - rand.Next(10)),
                            OrderType = rand.Next(30),
                            Address = "Address " + i,
                            PostalCode = "500-" + i,
                            PhoneNumber = "1-800-123-1" + i
                        };

                        for (var k = 0; k < rand.Next(10); k++)
                        {
                            order.Details.Add(new OrderDetail
                            {
                                Price = rand.Next(10),
                                Description = "Product ID" + rand.Next(1000),
                                Quantity = rand.Next(10),
                                ProductID = products[rand.Next(products.Length - 1)].ProductID
                            });
                        }

                        order.Amount = order.Details.Sum(x => x.Price*x.Quantity);

                        dbContext.Orders.Add(order);
                    }

                    dbContext.SaveChanges();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            });

            #endregion
        }
    }
}