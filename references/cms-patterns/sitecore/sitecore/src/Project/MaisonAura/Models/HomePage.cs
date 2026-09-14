using System;
using MaisonAura.Foundation.GlassMapper.Models;

namespace MaisonAura.Project.MaisonAura.Models
{
    public interface IHomePage : IGlassBase
    {
        string PageTitle { get; set; }
        string MetaDescription { get; set; }
    }

    public class HomePageItem : GlassBase, IHomePage
    {
        public static readonly Guid TemplateGuid = new Guid("{9F6B5C3E-12A4-428B-9E3F-78A1D3B62091}");

        public string PageTitle { get; set; } = string.Empty;
        public string MetaDescription { get; set; } = string.Empty;
    }
}
