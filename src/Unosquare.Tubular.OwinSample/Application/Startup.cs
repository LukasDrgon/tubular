﻿using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Routing;
using Unosquare.Tubular.Sample.Application;
using Unosquare.Tubular.Sample.Models;

[assembly: OwinStartup(typeof(Startup))]
namespace Unosquare.Tubular.Sample.Application
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var config = new HttpConfiguration();
            OAuth.Configure(app);
            WebApi.Configure(config);

            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            app.UseWebApi(config);
        }

        private static class OAuth
        {
            public static void Configure(IAppBuilder app)
            {
                var authFunc =
                    new Func<OAuthGrantResourceOwnerCredentialsContext, Task<UserAuthenticationResult>>(c =>
                    {
                        var task = new Task<UserAuthenticationResult>(() =>
                        {
                            using (var context = new SampleDbContext())
                            {
                                var user =
                                    context.SystemUsers.FirstOrDefault(
                                        u => u.Id == c.UserName && u.Password == c.Password);

                                if (user == null)
                                    return UserAuthenticationResult.CreateErrorResult("Invalid credentials");

                                var roles = user.Roles.ToArray();
                                return UserAuthenticationResult.CreateAuthorizedResult(user, roles);
                            }
                        });

                        task.Start();
                        return task;
                    });

                var authServerOptions = new OAuthAuthorizationServerOptions()
                {
                    AllowInsecureHttp = true,
                    TokenEndpointPath = new PathString("/token"),
                    AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                    Provider = new BasicOAuthAuthorizationProvider(authFunc),
                    AuthenticationMode = Microsoft.Owin.Security.AuthenticationMode.Active,
                    AuthenticationType = "Bearer"
                };
                
                // Token Generation
                app.UseOAuthBearerTokens(authServerOptions);
            }
        }

        private static class WebApi
        {
            public static void Configure(HttpConfiguration config)
            {
                // Web API configuration and services
                var json = config.Formatters.JsonFormatter;
                json.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.None;
                config.Formatters.Remove(config.Formatters.XmlFormatter);

                // Web API routes
                config.MapHttpAttributeRoutes();

                config.Routes.MapHttpRoute(
                    name: "DefaultApi",
                    routeTemplate: "api/{controller}/{id}",
                    defaults: new {id = RouteParameter.Optional}
                    );

                // Redirecting anything else to Index.html, you need to include this in your Web.config:
                //
                //          <compilation debug="true" targetFramework="4.5.2">
                //  <buildProviders>
                //    <add extension=".html" type="System.Web.Compilation.PageBuildProvider" />
                //    <!-- Allows for routing everything to ~/index.html -->
                //  </buildProviders>
                //</compilation>
                RouteTable.Routes.MapPageRoute("Default", "{*anything}", "~/index.html");
            }
        }
    }
}