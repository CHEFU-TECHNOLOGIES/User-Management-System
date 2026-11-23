export function AuditLogSkeleton() {
    return (
        <tr>
            <td colSpan={5}>
                <div
                    className="audit-skeleton"
                    role="status"
                    aria-label="Loading audit history"
                >
                    {Array.from({ length: 4 }, (_, row) => (
                        <div className="audit-skeleton-row" key={row} aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
}
