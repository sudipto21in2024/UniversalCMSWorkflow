using System;
using MaisonAura.Foundation.GlassMapper.Models;

namespace MaisonAura.Feature.BespokeInquiry.Models
{
    public interface IBespokeInquiry : IGlassBase
    {
        string FormTitle { get; set; }
        string FormSubtitle { get; set; }
        string ConciergeNotice { get; set; }
        string DirectTelephone { get; set; }
        string BoutiqueAddress { get; set; }
    }

    public class BespokeInquiryItem : GlassBase, IBespokeInquiry
    {
        public static readonly Guid TemplateGuid = new Guid("{E3B8A911-3322-4411-9922-1122334E5505}");

        public string FormTitle { get; set; } = string.Empty;
        public string FormSubtitle { get; set; } = string.Empty;
        public string ConciergeNotice { get; set; } = string.Empty;
        public string DirectTelephone { get; set; } = string.Empty;
        public string BoutiqueAddress { get; set; } = string.Empty;
    }
}
