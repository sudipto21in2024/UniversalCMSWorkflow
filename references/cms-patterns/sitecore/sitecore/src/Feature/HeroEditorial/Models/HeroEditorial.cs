using System;
using MaisonAura.Foundation.GlassMapper.Models;

namespace MaisonAura.Feature.HeroEditorial.Models
{
    public interface IHeroEditorial : IGlassBase
    {
        string Headline { get; set; }
        string Subheadline { get; set; }
        string SeasonTag { get; set; }
        string PrimaryCtaText { get; set; }
        SitecoreLinkField PrimaryCtaLink { get; set; }
        string SecondaryCtaText { get; set; }
        SitecoreLinkField SecondaryCtaLink { get; set; }
        SitecoreImageField HeroImage { get; set; }
        string CreditsLabel { get; set; }
    }

    public class HeroEditorialItem : GlassBase, IHeroEditorial
    {
        public static readonly Guid TemplateGuid = new Guid("{D5C2A11B-7821-4F9E-A021-3964893E1101}");

        public string Headline { get; set; } = string.Empty;
        public string Subheadline { get; set; } = string.Empty;
        public string SeasonTag { get; set; } = string.Empty;
        public string PrimaryCtaText { get; set; } = string.Empty;
        public SitecoreLinkField PrimaryCtaLink { get; set; } = new SitecoreLinkField();
        public string SecondaryCtaText { get; set; } = string.Empty;
        public SitecoreLinkField SecondaryCtaLink { get; set; } = new SitecoreLinkField();
        public SitecoreImageField HeroImage { get; set; } = new SitecoreImageField();
        public string CreditsLabel { get; set; } = string.Empty;
    }
}
