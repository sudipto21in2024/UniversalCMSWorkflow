using System;
using System.Collections.Generic;

namespace MaisonAura.Foundation.GlassMapper.Models
{
    public interface IGlassBase
    {
        Guid Id { get; set; }
        string Name { get; set; }
        string DisplayName { get; set; }
        Guid TemplateId { get; set; }
        string TemplateName { get; set; }
        string Language { get; set; }
        int Version { get; set; }
        string Url { get; set; }
    }

    public abstract class GlassBase : IGlassBase
    {
        public virtual Guid Id { get; set; }
        public virtual string Name { get; set; } = string.Empty;
        public virtual string DisplayName { get; set; } = string.Empty;
        public virtual Guid TemplateId { get; set; }
        public virtual string TemplateName { get; set; } = string.Empty;
        public virtual string Language { get; set; } = "en";
        public virtual int Version { get; set; } = 1;
        public virtual string Url { get; set; } = string.Empty;
    }

    public class SitecoreImageField
    {
        public string Src { get; set; } = string.Empty;
        public string Alt { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public string Class { get; set; } = string.Empty;
    }

    public class SitecoreLinkField
    {
        public string Href { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
    }
}
