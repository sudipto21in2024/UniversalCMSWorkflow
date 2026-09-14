using System;
using MaisonAura.Foundation.GlassMapper.Models;

namespace MaisonAura.Feature.CraftStory.Models
{
    public interface ICraftStory : IGlassBase
    {
        string Title { get; set; }
        string Subtitle { get; set; }
        string ChapterNumber { get; set; }
        string NarrativeLead { get; set; }
        string StoryBody { get; set; }
        string ArtisanQuote { get; set; }
        string ArtisanName { get; set; }
        string ArtisanRole { get; set; }
        SitecoreImageField ImageA { get; set; }
        SitecoreImageField ImageB { get; set; }
    }

    public class CraftStoryItem : GlassBase, ICraftStory
    {
        public static readonly Guid TemplateGuid = new Guid("{F8E4C32A-5521-419B-B921-9988224E2202}");

        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string ChapterNumber { get; set; } = string.Empty;
        public string NarrativeLead { get; set; } = string.Empty;
        public string StoryBody { get; set; } = string.Empty;
        public string ArtisanQuote { get; set; } = string.Empty;
        public string ArtisanName { get; set; } = string.Empty;
        public string ArtisanRole { get; set; } = string.Empty;
        public SitecoreImageField ImageA { get; set; } = new SitecoreImageField();
        public SitecoreImageField ImageB { get; set; } = new SitecoreImageField();
    }
}
