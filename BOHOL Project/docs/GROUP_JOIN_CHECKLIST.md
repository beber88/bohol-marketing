# Group Join Checklist - Panglao Prime Villas

After joining each Facebook group, document the following for every group.
Update the registry file (`data/facebook_groups_registry.json`) with this info.

---

## Checklist Per Group

After joining, check and record:

| # | Check | What to Record |
|---|---|---|
| 1 | **Member count** | Actual number shown on group page |
| 2 | **Can post as Blue Everest page?** | Yes / No / Not tested yet |
| 3 | **Are links allowed?** | Yes / Stripped / Admin-only |
| 4 | **Admin approval for posts?** | Yes (posts go to pending) / No (instant) |
| 5 | **Posting culture** | Listings / Discussion / Mixed / News |
| 6 | **Pinned rules?** | Read and summarize any pinned rules post |
| 7 | **Posting frequency** | What seems acceptable? (daily / 2x week / weekly) |
| 8 | **Competitor activity** | Are other developers/brokers posting? How often? |

---

## How to Check Page Posting

1. Open the group after joining
2. Click "Write something..." in the post composer
3. Look for "Posting as" option near your profile picture
4. If available, switch to "Blue Everest Asset Group"
5. If not available, you can only post as your personal profile

---

## Recording Results

For each group, update these fields in `data/facebook_groups_registry.json`:

```json
{
  "join_status": "joined",
  "joined_date": "2026-05-25",
  "member_count": 12500,
  "is_active_for_monitoring": true,
  "is_active_for_posting": true,
  "admin_posting_rules": {
    "allows_links": true,
    "allows_promotional": true,
    "requires_admin_approval": false,
    "posting_frequency_limit": "2_per_week",
    "notes": "Listing-focused group, property posts welcome"
  }
}
```

If a join request is pending:
```json
{
  "join_status": "pending",
  "join_request_date": "2026-05-25"
}
```

If rejected:
```json
{
  "join_status": "rejected",
  "is_active_for_posting": false,
  "notes": "Rejected - reason if known"
}
```

---

## Priority Order

Start with Tier 1 (GJ-001 to GJ-008), then Tier 2, then Tier 3.
Do NOT post any content until simulation mode is turned OFF.
