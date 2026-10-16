from pathlib import Path
p=Path('frontend/src/CrateOpenings.tsx');s=p.read_text(encoding='utf-8');s=s.replace("Math.max(0, ...(result.data?.rows.filter((r) => r.crate_type === Number(type) && r.campaign_start === result.data?.campaignStart).map((r) => r.revision) ?? []))", "result.data?.revisions?.find((r) => r.crate_type === Number(type))?.revision ?? 0");p.write_text(s,encoding='utf-8')
