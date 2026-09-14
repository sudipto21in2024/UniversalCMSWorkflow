using System;
using System.Collections.Generic;
using MaisonAura.Foundation.GlassMapper.Models;

namespace MaisonAura.Feature.Lookbook.Models
{
    public interface ILookbookItem : IGlassBase
    {
        string LookNumber { get; set; }
        string Title { get; set; }
        string Collection { get; set; }
        string Description { get; set; }
        string Silhouette { get; set; }
        string Fabric { get; set; }
        int AtelierHours { get; set; }
        SitecoreImageField HeroImage { get; set; }
    }

    public class LookbookItemModel : GlassBase, ILookbookItem
    {
        public static readonly Guid TemplateGuid = new Guid("{58E2E5B1-39E4-46C9-8FB0-77984BD4101A}");

        public string LookNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Collection { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Silhouette { get; set; } = string.Empty;
        public string Fabric { get; set; } = string.Empty;
        public int AtelierHours { get; set; }
        public SitecoreImageField HeroImage { get; set; } = new SitecoreImageField();
    }

    public interface ILookbookGrid : IGlassBase
    {
        string Heading { get; set; }
        string Subheading { get; set; }
        string CuratedSeason { get; set; }
        SitecoreLinkField ViewAllLink { get; set; }
        IEnumerable<ILookbookItem> Items { get; set; }
    }

    public class LookbookGridItem : GlassBase, ILookbookGrid
    {
        public static readonly Guid TemplateGuid = new Guid("{B2E1F44A-9932-487C-A111-6655443E3303}");

        public string Heading { get; set; } = string.Empty;
        public string Subheading { get; set; } = string.Empty;
        public string CuratedSeason { get; set; } = string.Empty;
        public SitecoreLinkField ViewAllLink { get; set; } = new SitecoreLinkField();
        public IEnumerable<ILookbookItem> Items { get; set; } = new List<ILookbookItem>();
    }
}
