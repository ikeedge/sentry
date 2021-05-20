import {Fragment} from 'react';
import {css} from '@emotion/react';
import styled from '@emotion/styled';

import {ModalRenderProps} from 'app/actionCreators/modal';
import GroupingActions from 'app/actions/groupingActions';
import Button from 'app/components/button';
import ButtonBar from 'app/components/buttonBar';
import Pagination from 'app/components/pagination';
import {t} from 'app/locale';
import {ChildFingerprint} from 'app/stores/groupingStore';
import space from 'app/styles/space';

import GroupingCard from './groupingCard';

type Props = ModalRenderProps & {
  groupId: string;
  groupings: ChildFingerprint[];
};

function Details({Header, Body, Footer, groupings, groupId, closeModal}: Props) {
  function handleSplit() {
    GroupingActions.split({
      groupId,
      loadingMessage: t('Splitting fingerprints\u2026'),
      successMessage: t('Fingerprints successfully queued for splitting.'),
      errorMessage: t('Unable to queue fingerprints for splitting.'),
    });
    closeModal();
  }

  return (
    <Fragment>
      <Header closeButton>{t('Grouping Options')}</Header>
      <Body>
        <Introduction>
          {t(
            'Reprocessing applies new debug files and grouping enhancements to this Issue'
          )}
        </Introduction>
        <GroupingCards>
          {groupings.map((grouping, index) => (
            <GroupingCard
              key={grouping.childId}
              label={t('Grouping - Level %s', index)}
              groupings={[[...groupings].splice(0, index + 1)].flat()}
            />
          ))}
        </GroupingCards>
        <Pagination pageLinks="" />
      </Body>
      <Footer>
        <StyledButtonBar gap={1}>
          <Button
            href="https://docs.sentry.io/platforms/native/data-management/debug-files/"
            external
          >
            {t('Read the docs')}
          </Button>
          <Button priority="primary" onClick={handleSplit}>
            {t('Save')}
          </Button>
        </StyledButtonBar>
      </Footer>
    </Fragment>
  );
}

export default Details;

const StyledButtonBar = styled(ButtonBar)`
  white-space: nowrap;
`;

export const modalCss = css`
  width: 90%;
`;

const GroupingCards = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  grid-gap: ${space(2)};
`;

const Introduction = styled('p')`
  font-size: ${p => p.theme.fontSizeLarge};
`;
