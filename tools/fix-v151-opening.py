from pathlib import Path
p=Path('backend/Application/CrateOpeningService.cs');s=p.read_text().replace('r.Dues.Length>5000','r.Dues.Length>200');p.write_text(s,encoding='utf-8')
p=Path('frontend/src/CrateOpenings.tsx');s=p.read_text().replace('campaign_label: string;', 'campaign_label: string; campaign_start: string;').replace('interface Result { installed: boolean;', 'interface Result { installed: boolean; campaignStart?: string;').replace('r.crate_type === Number(type)', 'r.crate_type === Number(type) && r.campaign_start === result.data?.campaignStart');p.write_text(s,encoding='utf-8')
