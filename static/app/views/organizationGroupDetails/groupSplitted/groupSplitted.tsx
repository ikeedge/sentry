import {Fragment, useEffect, useState} from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import {openModal} from 'app/actionCreators/modal';
import GroupingActions from 'app/actions/groupingActions';
import BulkController from 'app/components/bulkController';
import Button from 'app/components/button';
import ButtonBar from 'app/components/buttonBar';
import Checkbox from 'app/components/checkbox';
import EmptyStateWarning from 'app/components/emptyStateWarning';
import EventOrGroupHeader from 'app/components/eventOrGroupHeader';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import Pagination from 'app/components/pagination';
import {Panel, PanelTable} from 'app/components/panels';
import {t} from 'app/locale';
import GroupingStore, {Fingerprint} from 'app/stores/groupingStore';
import space from 'app/styles/space';
import {Group, Organization} from 'app/types';

type Props = {
  organization: Organization;
  groupId: Group['id'];
  location: Location;
};

function GroupSplitted({groupId, location, organization}: Props) {
  const [splittedItems, setSplittedItems] = useState<Fingerprint[]>([]);
  const [selectedSplittedItems, setSelectedSplittedItems] = useState<string[]>([]);
  const [pagination, setPagination] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const listener = GroupingStore.listen(onGroupingChange, undefined);
    fetchData();
    return () => {
      listener();
    };
  }, []);

  function onGroupingChange({mergedItems, mergedLinks, loading, error}) {
    setIsLoading(typeof loading !== 'undefined' ? loading : false);
    setHasError(typeof error !== 'undefined' ? error : false);
    setSplittedItems(mergedItems ?? []);
    setPagination(mergedLinks);
  }

  function fetchData() {
    GroupingActions.fetch([
      {
        endpoint: `/issues/${groupId}/hashes/split/`,
        dataKey: 'merged',
        queryParams: location.query,
      },
    ]);
  }

  function handleChange({
    selectedIds,
  }: Parameters<NonNullable<BulkController['props']['onChange']>>[0]) {
    setSelectedSplittedItems(selectedIds);
  }

  async function handleOpenView(splittedItemIndex: number) {
    const mod = await import('app/views/organizationGroupDetails/groupSplitted/details');

    const {default: Modal, modalCss} = mod;

    openModal(
      deps => (
        <Modal
          {...deps}
          groupings={splittedItems[splittedItemIndex].children}
          groupId={groupId}
        />
      ),
      {
        modalCss,
      }
    );
  }

  function renderContent() {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (hasError) {
      return (
        <LoadingError
          message={t('Unable to load merged events, please try again later')}
          onRetry={fetchData}
        />
      );
    }

    const fingerprintsWithLatestEvent = splittedItems.filter(
      ({latestEvent}) => !!latestEvent
    ) as Fingerprint[];

    const hasResults = fingerprintsWithLatestEvent.length > 0;

    if (!hasResults) {
      return (
        <Panel>
          <EmptyStateWarning>
            <p>{t("There don't seem to be any hashes for this issue.")}</p>
          </EmptyStateWarning>
        </Panel>
      );
    }

    return (
      <Fragment>
        <BulkController
          pageIds={fingerprintsWithLatestEvent.map(({id}) => id)}
          defaultSelectedIds={selectedSplittedItems}
          allRowsCount={fingerprintsWithLatestEvent.length}
          onChange={handleChange}
          columnsCount={0}
        >
          {({
            selectedIds,
            onPageRowsToggle,
            onRowToggle,
            isPageSelected,
            renderBulkNotice,
          }) => (
            <Fragment>
              <Actions>
                <ButtonBar gap={1}>
                  <Button size="small" disabled={selectedIds.length < 2}>
                    {t('Unmerged')}
                  </Button>
                  <Button size="small" disabled={selectedIds.length < 2}>
                    {t('Compare')}
                  </Button>
                </ButtonBar>
              </Actions>
              <StyledPanelTable
                headers={[
                  <Checkbox
                    key="bulk-checkbox"
                    checked={isPageSelected}
                    onChange={() => onPageRowsToggle(!isPageSelected)}
                  />,
                  t('Issue'),
                  t('Event count'),
                  t('Details'),
                ]}
              >
                {renderBulkNotice()}
                {fingerprintsWithLatestEvent.map(
                  ({id, label, latestEvent, eventCount}, index) => (
                    <Fragment key={id}>
                      <div>
                        <Checkbox
                          checked={selectedIds.includes(id)}
                          onChange={() => onRowToggle(id)}
                        />
                      </div>
                      <div>
                        <EventOrGroupHeader
                          data={latestEvent}
                          organization={organization}
                          hideIcons
                          hideLevel
                        />
                        <Details>
                          {label && (
                            <Fragment>
                              <strong>{label}</strong>
                              <Divider>{'|'}</Divider>
                            </Fragment>
                          )}
                          <code>{id}</code>
                        </Details>
                      </div>
                      <div>{eventCount}</div>
                      <div>
                        <Button size="xsmall" onClick={() => handleOpenView(index)}>
                          {t('View')}
                        </Button>
                      </div>
                    </Fragment>
                  )
                )}
              </StyledPanelTable>
            </Fragment>
          )}
        </BulkController>
        <Pagination pageLinks={pagination} />
      </Fragment>
    );
  }

  return (
    <Wrapper>
      <StyledH4>{t('Merged issues')}</StyledH4>
      {renderContent()}
    </Wrapper>
  );
}

export default GroupSplitted;

const Wrapper = styled('div')`
  display: grid;
  grid-gap: ${space(1)};
`;

const StyledPanelTable = styled(PanelTable)`
  grid-template-columns: max-content 1fr max-content max-content;
  > :nth-child(4n-1),
  > :nth-child(4n) {
    display: flex;
    text-align: right;
    justify-content: flex-end;
    align-items: center;
  }
`;

const Actions = styled('div')`
  display: flex;
  justify-content: flex-end;
`;

const Details = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  display: grid;
  align-items: center;
  grid-gap: ${space(1)};
`;

const Divider = styled('div')`
  color: ${p => p.theme.gray200};
`;

const StyledH4 = styled('h4')`
  margin-bottom: 0;
`;
